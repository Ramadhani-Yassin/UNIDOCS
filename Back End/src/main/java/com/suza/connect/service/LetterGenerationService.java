package com.suza.connect.service;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.Map;

@Service
public class LetterGenerationService {

    public File fillTemplate(String templatePath, Map<String, String> placeholders) throws Exception {
        File templateFile = new File(templatePath);
        if (!templateFile.exists()) {
            throw new FileNotFoundException("Template not found: " + templatePath);
        }

        try (FileInputStream fis = new FileInputStream(templateFile);
             XWPFDocument doc = new XWPFDocument(fis)) {

            // Replace placeholders in paragraphs
            for (XWPFParagraph paragraph : doc.getParagraphs()) {
                for (XWPFRun run : paragraph.getRuns()) {
                    String text = run.getText(0);
                    if (text != null) {
                        for (Map.Entry<String, String> entry : placeholders.entrySet()) {
                            text = text.replace("{{" + entry.getKey() + "}}", entry.getValue() != null ? entry.getValue() : "");
                        }
                        run.setText(text, 0);
                    }
                }
            }

            // Save filled DOCX to temp file
            File filledDocx = File.createTempFile("filled_letter", ".docx");
            try (FileOutputStream fos = new FileOutputStream(filledDocx)) {
                doc.write(fos);
            }
            return filledDocx;
        }
    }

    public File convertDocxToPdf(File docxFile) throws Exception {
        File pdfFile = new File(docxFile.getAbsolutePath().replace(".docx", ".pdf"));
        ProcessBuilder pb = new ProcessBuilder(
            "libreoffice",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", docxFile.getParent(),
            docxFile.getAbsolutePath()
        );
        pb.redirectErrorStream(true);
        Process process = pb.start();
        int exitCode = process.waitFor();
        if (exitCode != 0 || !pdfFile.exists()) {
            throw new IOException("Failed to convert DOCX to PDF using LibreOffice.");
        }
        return pdfFile;
    }
}