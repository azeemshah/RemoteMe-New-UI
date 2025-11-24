import axios from "axios";
import { API_URL } from "../config";

export const loginRequest = async (email, password, isAdminLogin) => {
	return axios.post(
		`${API_URL}/auth/${isAdminLogin ? "admin/login" : "login"}`,
		{ email, password }
	);
};

export const verifyOtp = async (sessionId, otp) => {
	return axios.post(`${API_URL}/auth/verify-otp/${sessionId}`, { otp });
};
