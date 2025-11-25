import { useContext } from "react";
import { AuthContext } from "../contexts/Authcontext";

export const useAuth = () => {
  return useContext(AuthContext);
};
