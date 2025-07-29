/*
 *  Firebase Authentication
 */
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from "./firebaseConfig";

// const handleGoogleLogin = async () => {
//   const provider = new GoogleAuthProvider();
//   try {
//     const result = await signInWithPopup(auth, provider);
//     const user = result.user;
//     console.log("로그인 성공:", user.displayName);
//   } catch (error) {
//     console.error("로그인 에러", error);
//   }
// };

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google 로그인 실패:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
};