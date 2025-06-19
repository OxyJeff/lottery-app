
// This tells TypeScript that XLSX is a global variable provided by the CDN script
declare var XLSX: any;

export const parseExcelFile = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        if (!event.target?.result) {
          reject(new Error("读取文件失败。"));
          return;
        }
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          reject(new Error("Excel文件中未找到工作表。"));
          return;
        }
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Assuming names are in the first column (A)
        // XLSX.utils.sheet_to_json can convert sheet to an array of objects
        // For a simple list of names from the first column:
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        const names: string[] = jsonData
          .map((row: any) => row[0]?.toString().trim()) // Get first cell of each row
          .filter((name: string) => name && name.length > 0); // Filter out empty names
        
        if (names.length === 0) {
          reject(new Error("第一个工作表的第一列中未找到任何姓名。"));
          return;
        }
        resolve(names);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        reject(new Error("Excel文件无效或已损坏。"));
      }
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(new Error("读取文件时出错。"));
    };

    reader.readAsArrayBuffer(file);
  });
};