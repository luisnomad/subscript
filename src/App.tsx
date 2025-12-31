import React from "react";

import { PendingQueueView } from "@/components/pending/PendingQueueView";
import { Toaster } from "@/components/ui/toaster";

function App(): React.ReactElement {
  return (
    <>
      <PendingQueueView />
      <Toaster />
    </>
  );
}

export default App;
