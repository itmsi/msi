import { Toaster } from "react-hot-toast";
import { ScrollToTop } from "../../components/common/ScrollToTop";
import ClientRoutes from "../Client/ClientRoutes";
import AIAssistant from "@/components/ui/AIAssistant/AIAssistant";
import { useAuth } from "@/context/AuthContext";

const App = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "font-poppins text-md",
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
          },
        }}
      />
      <ScrollToTop />
      <ClientRoutes />
      {/* Only show AI Assistant when user is authenticated and not loading */}
      {isAuthenticated && !isLoading && <AIAssistant />}
    </>
  );
};

export default App;
