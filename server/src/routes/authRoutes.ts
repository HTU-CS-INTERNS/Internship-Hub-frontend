
import { Router } from 'express';
import { registerStudent, loginUser, logoutUser, getCurrentUserController } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route POST /api/auth/register/student
 * @description Register a new student
 * @access Public
 */
router.post('/register/student', registerStudent);

/**
 * @route POST /api/auth/login
 * @description Login an existing user
 * @access Public
 */
router.post('/login', loginUser);

/**
 * @route GET /api/auth/me
 * @description Get the profile of the currently authenticated user
 * @access Private
 */
router.get('/me', protect, getCurrentUserController);

/**
 * @route POST /api/auth/logout
 * @description Logout the current user by invalidating the token.
 * @access Private
 */
router.post('/logout', protect, logoutUser);


// Example: OTP generation route (conceptual)
// This would typically generate an OTP and send it via email/SMS
// router.post('/send-otp', async (req, res) => {
//   const { email } = req.body;
//   if (!email) {
//     return res.status(400).json({ message: "Email is required" });
//   }
//   try {
//     // const otp = generateOtp(); // Your OTP generation logic
//     // await storeOtp(email, otp); // Store OTP with expiration
//     // await sendOtpEmail(email, otp); // Your email sending logic
//     // For simulation:
//     const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
//     console.log(`Simulated OTP for ${email}: ${simulatedOtp}`);
//     return res.status(200).json({ message: "OTP 'sent' successfully (simulated)", otp: simulatedOtp });
//   } catch (error) {
//     console.error("Error in send-otp route:", error);
//     return res.status(500).json({ message: "Failed to send OTP" });
//   }
// });


export default router;
