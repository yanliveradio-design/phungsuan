import * as XLSX from "xlsx";

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExcelTemplateOptions {
  columns: ExcelColumn[];
  exampleRows?: Record<string, any>[];
  filename: string;
  sheetName?: string;
}

/**
 * Generates and downloads an Excel template file with specified columns and example data
 */
export function downloadExcelTemplate(options: ExcelTemplateOptions): void {
  const { columns, exampleRows = [], filename, sheetName = "Sheet1" } = options;

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  
  // Prepare data with headers
  const data: any[][] = [columns.map(col => col.header)];
  
  // Add example rows if provided
  exampleRows.forEach(row => {
    const rowData = columns.map(col => row[col.key] || "");
    data.push(rowData);
  });

  // Create worksheet from data
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths if specified
  const colWidths = columns.map(col => ({
    wch: col.width || 15
  }));
  worksheet["!cols"] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate and download file
  XLSX.writeFile(workbook, filename);
}

/**
 * Download template for book import
 */
export function downloadBookImportTemplate(): void {
  downloadExcelTemplate({
    columns: [
      { header: "Tên sách", key: "title", width: 30 },
      { header: "Tác giả", key: "author", width: 20 },
      { header: "Thể loại", key: "category", width: 15 },
      { header: "URL Ảnh bìa", key: "coverUrl", width: 40 },
      { header: "Tỉnh/Thành", key: "province", width: 15 },
      { header: "Quận/Huyện", key: "district", width: 15 },
      { header: "Tên chủ sở hữu", key: "ownerName", width: 20 },
      { header: "SĐT Full", key: "ownerPhoneFull", width: 15 },
    ],
    exampleRows: [
      {
        title: "Đắc Nhân Tâm",
        author: "Dale Carnegie",
        category: "Kỹ năng sống",
        coverUrl: "https://example.com/dac-nhan-tam.jpg",
        province: "Hà Nội",
        district: "Cầu Giấy",
        ownerName: "Nguyễn Văn A",
        ownerPhoneFull: "0987651234",
      },
      {
        title: "Sapiens: Lược sử loài người",
        author: "Yuval Noah Harari",
        category: "Lịch sử",
        coverUrl: "https://example.com/sapiens.jpg",
        province: "TP. Hồ Chí Minh",
        district: "Quận 1",
        ownerName: "Trần Thị B",
        ownerPhoneFull: "0912345678",
      },
      {
        title: "Nhà Giả Kim",
        author: "Paulo Coelho",
        category: "Văn học",
        coverUrl: "https://example.com/nha-gia-kim.jpg",
        province: "Đà Nẵng",
        district: "Hải Châu",
        ownerName: "Lê Văn C",
        ownerPhoneFull: "0909999999",
      },
    ],
    filename: "template_import_sach.xlsx",
    sheetName: "Danh sách sách",
  });
}