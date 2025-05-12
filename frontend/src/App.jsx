import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TursoProvider } from "@/context/TursoContext";
import AppRoutes from "@/routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <TursoProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground">
              <AppRoutes />
              <Toaster />
            </div>
          </AuthProvider>
        </TursoProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
