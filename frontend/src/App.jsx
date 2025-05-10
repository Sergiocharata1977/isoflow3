import React, { Suspense } from "react";
import MenuPrincipal from "./components/menu/MenuPrincipal";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-hidden">
        {/* Content area - Full width */}
        <div className="flex-1">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          }>
            <MenuPrincipal />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default App;
