import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import useUpdateProfile from "../hooks/useUpdateProfile";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

function UpdateProfile() {
	const updateProfile = useUpdateProfile();

	return (
		<div className="d-flex min-vh-100 flex-column">
			<Header />
			<div className="d-flex flex-grow-1">
				<Sidebar />
				<main className="content flex-grow-1">
					<section className="container">
						<div className="row g-4">
							<div className="col-lg-12">
								<h5 className="mb-0 fw-semibold mb-4">
									<i className="bi bi-person-up text-primary me-2"></i>Update
									Profile
								</h5>
								<div className="card border-0 shadow-sm mb-4">
									<div className="card-body">
										{!updateProfile.successMessage &&
											updateProfile.serverError && (
												<div className="alert alert-danger">
													{updateProfile.serverError}
												</div>
											)}
										{updateProfile.successMessage && (
											<div className="alert alert-success">
												{updateProfile.successMessage}
											</div>
										)}

										<form
											onSubmit={updateProfile.handleSubmit}
											encType="multipart/form-data"
										>
											<div className="row">
												<div className="col-sm-6">
													<div className="mb-3">
														<label className="form-label">
															First Name <span className="text-danger">*</span>
														</label>
														<input
															type="text"
															name="first_name"
															className={`form-control ${
																updateProfile.errors.first_name
																	? "is-invalid"
																	: ""
															}`}
															value={updateProfile.form.first_name}
															onChange={updateProfile.handleChange}
														/>
														{updateProfile.errors.first_name && (
															<div className="invalid-feedback">
																{updateProfile.errors.first_name}
															</div>
														)}
													</div>
												</div>
												<div className="col-sm-6">
													<div className="mb-3">
														<label className="form-label">
															Last Name <span className="text-danger">*</span>
														</label>
														<input
															type="text"
															name="last_name"
															className={`form-control ${
																updateProfile.errors.last_name
																	? "is-invalid"
																	: ""
															}`}
															value={updateProfile.form.last_name}
															onChange={updateProfile.handleChange}
														/>
														{updateProfile.errors.last_name && (
															<div className="invalid-feedback">
																{updateProfile.errors.last_name}
															</div>
														)}
													</div>
												</div>
												<div className="col-sm-6">
													<div className="mb-3">
														<label
															className="form-label"
															htmlFor="phone-input-id"
														>
															Contact Number
														</label>
														<PhoneInput
															inputProps={{
																name: "phone",
																id: "phone-input-id",
															}}
															country={updateProfile.countryCode}
															value={updateProfile.form.contact_number}
															onChange={(value) => {
																updateProfile.handleChange({
																	target: {
																		name: "contact_number",
																		value: value,
																	},
																});
															}}
															inputClass={`form-control ${
																updateProfile.errors.contact_number
																	? "is-invalid"
																	: ""
															}`}
															inputStyle={{ width: "100%" }}
														/>
														{updateProfile.errors.contact_number && (
															<div className="text-danger">
																{updateProfile.errors.contact_number}
															</div>
														)}
													</div>
												</div>
												<div className="col-sm-6">
													<div className="mb-3">
														<label className="form-label">
															Email <span className="text-danger">*</span>
														</label>
														<input
															type="text"
															name="email"
															className={`form-control ${
																updateProfile.errors.email ? "is-invalid" : ""
															}`}
															value={updateProfile.form.email}
															onChange={updateProfile.handleChange}
															disabled={
																updateProfile.user &&
																updateProfile.user.roles.includes("admin")
															}
														/>
														{updateProfile.errors.email && (
															<div className="invalid-feedback">
																{updateProfile.errors.email}
															</div>
														)}
													</div>
												</div>
												<div className="col-sm-6">
													<div className="mb-3">
														<label className="form-label">Avatar</label>
														<input
															type="file"
															name="avatar"
															className={`form-control ${
																updateProfile.errors.avatar ||
																updateProfile.errors.file
																	? "is-invalid"
																	: ""
															}`}
															onChange={updateProfile.handleFileChange}
														/>
														{(updateProfile.errors.avatar ||
															updateProfile.errors.file) && (
															<div className="invalid-feedback">
																{(
																	updateProfile.errors.avatar ||
																	updateProfile.errors.file ||
																	[]
																).join(", ")}
															</div>
														)}
													</div>
												</div>
											</div>
											<div className="text-end">
												<button
													type="submit"
													className="btn btn-primary"
													disabled={updateProfile.loading}
												>
													{updateProfile.loading
														? "Updating…"
														: "Update Profile"}
												</button>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
					</section>
				</main>
			</div>
			<Footer />
		</div>
	);
}

export default UpdateProfile;
