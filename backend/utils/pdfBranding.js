import axios from "axios";
import fs from "fs";
import path from "path";

export async function downloadTempImage(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  const p = path.join("./invoices", `tmp_${Date.now()}.img`);
  fs.writeFileSync(p, Buffer.from(res.data));
  return p;
}

export async function drawBrandedHeader(doc, { logoUrl, businessName, gstNumber, address, brandColor }) {
  const color = brandColor || "#111827";
  doc.rect(0, 0, doc.page.width, 60).fill(color).fillColor("#ffffff");

  let xStart = 40;
  if (logoUrl) {
    try {
      const tmp = await downloadTempImage(logoUrl);
      doc.image(tmp, 40, 10, { width: 40, height: 40 });
      fs.unlink(tmp, () => {});
      xStart = 90;
    } catch {}
  }

  doc.fontSize(16).fillColor("#ffffff").text(businessName || "Your Business", xStart, 18);
  doc.fontSize(10).text(`GSTIN: ${gstNumber || "-"}`, xStart, 38);
  doc.fontSize(10).text(address || "", xStart, 52, { width: doc.page.width - xStart - 40, ellipsis: true });

  doc.moveDown(2).fillColor("#111111");
  doc.moveTo(40, 80).lineTo(doc.page.width - 40, 80).strokeColor("#e5e7eb").stroke();
}
