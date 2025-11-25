import { useState, useContext, useEffect } from "react";
import axiosInstance from "../services/axiosService";
import { AuthContext } from "../contexts/Authcontext";

const useUpdateProfile = () => {
	const { user, setUser } = useContext(AuthContext);
	const [form, setForm] = useState({
		first_name: "",
		last_name: "",
		contact_number: "",
		email: "",
		avatar: null,
	});
	const [errors, setErrors] = useState({});
	const [serverError, setServerError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user) {
			setForm({
				first_name: user.first_name,
				last_name: user.last_name,
				contact_number: user.contact_number,
				email: user.email,
				avatar: null,
			});
		}
	}, [user]);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleFileChange = (e) => {
		setForm({ ...form, avatar: e.target.files[0] || null });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrors({});
		setServerError("");
		setSuccessMessage("");
		setLoading(true);

		try {
			const data = new FormData();
			data.append("first_name", form.first_name);
			data.append("last_name", form.last_name);
			if (form.contact_number) {
				data.append("contact_number", form.contact_number);
			}

			if (!user.roles.includes("admin")) {
				// Admin user can not change email
				data.append("email", form.email);
			}

			if (form.avatar) data.append("avatar", form.avatar);

			const result = await axiosInstance.patch("/auth/update-profile", data, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			if (result.status === 400 && result.response.data.errors) {
				setErrors(result.response.data.errors);
			} else if (result.status === 200 || result.status === 201) {
				const updatedUser = result.data.user;
				setUser(updatedUser);
				localStorage.setItem("user", JSON.stringify(updatedUser));
				setServerError("");
				setSuccessMessage(
					result.data.message || "Profile updated successfully."
				);

				setForm({
					first_name: updatedUser.first_name,
					last_name: updatedUser.last_name,
					contact_number: updatedUser.contact_number,
					email: updatedUser.email,
					avatar: updatedUser.avatar,
				});
			} else if (result.status === 404) {
				setServerError(result.response.data.message);
			} else if (result.status === 409) {
				setServerError(result.response.data.message);
			} else {
				setServerError("Unexpected response from server. Try again later.");
			}
		} catch (err) {
			if (!err.response) {
				setServerError("Network error. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	return {
		user,
		form,
		errors,
		serverError,
		successMessage,
		loading,
		handleChange,
		handleFileChange,
		handleSubmit,
	};
};

export default useUpdateProfile;
