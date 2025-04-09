
import { backupData, restoreData } from "./offlineStorage";

/**
 * Sets up bridges between the web app and Electron when running as a desktop application
 */
export const setupElectronBridge = () => {
  if (typeof window !== 'undefined') {
    // Export function that Electron menu can call
    (window as any).exportData = () => {
      const backupUrl = backupData();
      const element = document.createElement("a");
      element.href = backupUrl;
      element.download = `dmart-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    };

    // Import function that Electron menu can call
    (window as any).importData = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target?.result as string;
          const success = restoreData(data);
          
          if (success) {
            alert("Data restored successfully. The application will now reload.");
            window.location.reload();
          } else {
            alert("Failed to restore data. The file might be corrupted.");
          }
        };
        reader.readAsText(file);
      };
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    };
  }
};
