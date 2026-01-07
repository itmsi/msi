import { Toaster } from "react-hot-toast";
import { ScrollToTop } from "../../components/common/ScrollToTop";
import ClientRoutes from "../Client/ClientRoutes";
import AIAssistant from "@/components/ui/AIAssistant/AIAssistant";

const App = () => {
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
      <AIAssistant />
    </>
  );
};

export default App;
