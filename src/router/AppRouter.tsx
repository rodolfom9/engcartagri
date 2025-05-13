
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "../pages/Index";
import Auth from "../pages/Auth";
import NotFound from "../pages/NotFound";

const AppRouter = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
};

export default AppRouter;
