import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const useAuthCheck = () => {
  const { isAuthenticated } = useAuth();

  const validateLogin = () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in", { position: "bottom-right" });
      return false;
    }
    return true;
  };

  return { validateLogin };
};

export default useAuthCheck;