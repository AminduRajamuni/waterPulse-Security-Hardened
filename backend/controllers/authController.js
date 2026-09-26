import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Register a new user (default role: citizen)
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      city,
      district,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password with bcrypt
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "citizen", // Default role
      phoneNumber,
      location: {
        city: city || "",
        district: district || "",
      },
    });

    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({
        message: "Server error during registration",
        error: error.message,
      });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Server error during login", error: error.message });
  }
};

// Create admin or authority (temporary endpoint for admin creation)
export const createAdminOrAuthority = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phoneNumber,
      city,
      district,
    } = req.body;

    // Validate role
    if (!["admin", "authority"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be admin or authority" });
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new admin/authority user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
      location: {
        city: city || "",
        district: district || "",
      },
    });

    await newUser.save();

    res.status(201).json({
      message: `${role} created successfully`,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Create admin/authority error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------- Google Sign-In / Sign-Up (OAuth2 Authorization Code + OIDC) ----------

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const oauthClient = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: GOOGLE_CALLBACK_URL,
});

const STATE_TTL_MS = 5 * 60 * 1000; // time allowed to complete the Google consent screen
const CODE_TTL_MS = 60 * 1000; // one-time frontend handoff code, deliberately short-lived

// In-memory stores: fine for a single-instance dev/assignment deployment. A
// production/multi-instance deployment would use Redis or a DB TTL collection instead,
// since these are wiped on restart and don't share state across processes.
const pendingStates = new Map(); // state -> expiresAt
const pendingCodes = new Map(); // code -> { token, user, expiresAt }

const cleanupExpired = (map) => {
  const now = Date.now();
  for (const [key, value] of map) {
    const expiresAt = typeof value === "number" ? value : value.expiresAt;
    if (expiresAt < now) map.delete(key);
  }
};

// Manual cookie read (no cookie-parser dependency needed for one value).
const getCookie = (req, name) => {
  const header = req.headers.cookie;
  if (!header) return null;
  const match = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

const issueJwtForUser = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

const toUserResponse = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
});

// GET /api/auth/google
// Step 1 of the flow: send the browser to Google's consent screen.
export const googleAuthRedirect = (req, res) => {
  cleanupExpired(pendingStates);

  // A random, unguessable state value ties this specific browser's request to the
  // callback that comes back later - see googleAuthCallback for why that matters.
  const state = crypto.randomBytes(32).toString("hex");
  pendingStates.set(state, Date.now() + STATE_TTL_MS);

  res.cookie("oauth_state", state, {
    httpOnly: true, // not readable/tamperable from frontend JS
    sameSite: "lax",
    maxAge: STATE_TTL_MS,
  });

  const authUrl = oauthClient.generateAuthUrl({
    scope: ["openid", "email", "profile"],
    state,
    prompt: "select_account",
  });

  res.redirect(authUrl);
};

// GET /api/auth/google/callback
// Step 2: Google redirects here with ?code=...&state=...
export const googleAuthCallback = async (req, res) => {
  const failRedirect = (reason) =>
    res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(reason)}`);

  try {
    cleanupExpired(pendingStates);

    const { code, state } = req.query;
    const cookieState = getCookie(req, "oauth_state");
    res.clearCookie("oauth_state");

    if (!code || !state) {
      return failRedirect("Missing authorization code or state");
    }

    // CSRF check. The state must be one we issued AND must match the cookie set on
    // this same browser before it was sent to Google. Checking only "did we issue
    // this state at some point" would not be enough: an attacker could complete
    // their own Google login, capture their own valid code+state pair, then trick a
    // victim into opening this callback URL with the attacker's values - logging the
    // victim into the attacker's account (a login-CSRF / session fixation attack).
    // The cookie can only exist on the browser that actually started this flow, so
    // the attacker cannot reproduce it on the victim's browser.
    if (!cookieState || cookieState !== state || !pendingStates.has(state)) {
      return failRedirect("Invalid or expired state parameter");
    }
    pendingStates.delete(state); // one-time use

    // Exchange the authorization code for tokens. This is a server-to-server call
    // authenticated with our client secret, so the code can't be replayed by anyone
    // who merely observes it in the browser's address bar.
    const { tokens } = await oauthClient.getToken(code);

    // Verify the ID token ourselves instead of trusting anything from the frontend:
    // this checks the signature against Google's rotating public keys, the issuer
    // (accounts.google.com), the audience (our GOOGLE_CLIENT_ID), and expiry.
    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      return failRedirect("Google account email is not verified");
    }

    const { email, sub: googleId, given_name, family_name, name } = payload;

    let user = await User.findOne({ email });

    if (user) {
      // Link this Google login to the existing account rather than creating a duplicate.
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // No existing account for this email: create one, matching register()'s
      // default role. There is no password for a Google-only account.
      user = new User({
        firstName: given_name || name || "Google",
        lastName: family_name || "User",
        email,
        password: null,
        role: "citizen",
        googleId,
      });
      await user.save();
    }

    const token = issueJwtForUser(user);

    // Hand off to the frontend via a short-lived, single-use code rather than
    // putting the real JWT in the redirect URL. Our JWT is long-lived (7 days) and
    // a URL can end up in browser history, Referer headers, or server access logs -
    // this code is worthless after ~60 seconds or a single exchange, whichever
    // comes first, so even if it leaks, the real session token never does.
    cleanupExpired(pendingCodes);
    const handoffCode = crypto.randomBytes(32).toString("hex");
    pendingCodes.set(handoffCode, {
      token,
      user: toUserResponse(user),
      expiresAt: Date.now() + CODE_TTL_MS,
    });

    res.redirect(`${FRONTEND_URL}/oauth/callback?code=${handoffCode}`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    failRedirect("Google sign-in failed");
  }
};

// POST /api/auth/google/exchange
// Body: { code } - Step 3: the frontend trades the one-time code for our real JWT.
export const googleAuthExchange = (req, res) => {
  cleanupExpired(pendingCodes);
  const { code } = req.body;

  if (!code || !pendingCodes.has(code)) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  const { token, user } = pendingCodes.get(code);
  pendingCodes.delete(code); // one-time use

  res.status(200).json({ message: "Login successful", token, user });
};

// Get current user (requires auth middleware)
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
