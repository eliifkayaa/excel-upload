const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const Pdks = require("../models/pdks");
const fs = require("fs");
const path = require("path");
// const storage = multer.diskStorage({
  
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "../uploads"));
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const extension = path.extname(file.originalname);
//     const fileName = uniqueSuffix + extension;
//     req.fileName = fileName;
//     req.fileNames = req.fileNames || [];
//     req.fileNames.push(fileName); // Birden fazla dosya için dosya adlarını sakla
//     cb(null, fileName);
//   },
// });

// const upload = multer({ storage: storage });

// router.post("/upload", upload.single("file"), async (req, res) => {
//   const filePath = req.file.path;

//   try {
//     const destinationPath = path.join(__dirname, "../uploads", req.fileName);
//     fs.renameSync(filePath, destinationPath);
//     req.file.path = destinationPath;

//     const workbook = XLSX.readFile(destinationPath);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];

//     const pdksData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

//     const transformedData = pdksData.map((pdks) => {
//       const parsedToplam = parseFloat(pdks["toplam"]?.toString()?.replace(",", ".")) || 0;

//       const tarih = pdks["tarih"] || "";

//       const giris = pdks["giris"] || "";
//       const cikis = pdks["cikis"] || "";

//       const parsedIzinsuresi =
//         parseFloat(pdks["izinsuresi"]?.toString()?.replace(",", ".")) || 0;

//       return {
//         pdkskod: pdks["pdkskod"],
//         tarih,
//         giris,
//         cikis,
//         toplam: parsedToplam,
//         izintipi: pdks["izintipi"],
//         izinsuresi: parsedIzinsuresi,
//         dosyaAdi: req.file.filename,
//         dosyaYolu: req.file.path,
//       };
//     });

//     await Pdks.insertMany(transformedData);

//     res.status(200).json({ fileName: req.fileName, filePath: req.file.path });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Dosya yükleme işleminde bir hata oluştu");
//   }
// });

//Değiştirilmemiş kodlar
// router.get("/", async (req, res) => {
//   try {
//     const pdksData = await Pdks.find({});
//     res.send(pdksData);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// });
// router.delete("/:dosyaAdi", async (req, res) => {
//   const dosyaAdi = req.params.dosyaAdi;

//   try {
//     // Veritabanından belgeyi bul ve sil
//     const pdksEntry = await Pdks.findOne({ dosyaAdi });
//     if (!pdksEntry) {
//       return res.status(404).send("Dosya bulunamadı");
//     }
//     fs.unlinkSync(pdksEntry.dosyaYolu); // "uploads" klasöründen sil
//     await Pdks.deleteMany({});

//     // Başarı durumunda boş bir yanıt gönder
//     res.send([]);

//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const fileName = uniqueSuffix + extension;
    req.fileName = fileName;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.array("files"), async (req, res) => {
  const uploadedFiles = req.files;
  const transformedData = [];
  const fileNames = [];

  for (const file of uploadedFiles) {
    const fileName = file.originalname;

    if (!fileNames.includes(fileName)) {
      fileNames.push(fileName);

      const filePath = file.path;

      try {
        const destinationPath = path.join(__dirname, "../uploads", file.filename);
        fs.renameSync(filePath, destinationPath);
        file.path = destinationPath;

        const workbook = XLSX.readFile(destinationPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const pdksData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        const fileData = pdksData.map((pdks) => {
          const parsedToplam = parseFloat(pdks["toplam"]?.toString()?.replace(",", ".")) || 0;

          const tarih = pdks["tarih"] || "";

          const giris = pdks["giris"] || "";
          const cikis = pdks["cikis"] || "";

          const parsedIzinsuresi =
            parseFloat(pdks["izinsuresi"]?.toString()?.replace(",", ".")) || 0;

          return {
            pdkskod: pdks["pdkskod"],
            tarih,
            giris,
            cikis,
            toplam: parsedToplam,
            izintipi: pdks["izintipi"],
            izinsuresi: parsedIzinsuresi,
            dosyaAdi: fileName,
            dosyaYolu: file.path,
          };
        });

        transformedData.push(...fileData);
      } catch (err) {
        console.error(err);
        res.status(500).send("Dosya yükleme işleminde bir hata oluştu");
      }
    }
  }

  await Pdks.insertMany(transformedData);

  res.status(200).json({ files: fileNames });
});

router.get("/", async (req, res) => {
  try {
    const pdksData = await Pdks.find({});
    res.send(pdksData);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.delete("/:dosyaAdi", async (req, res) => {
  const dosyaAdi = req.params.dosyaAdi;

  try {
    // Veritabanından belgeyi bul ve sil
    const pdksEntry = await Pdks.findOne({ dosyaAdi });
    if (!pdksEntry) {
      return res.status(404).send("Dosya bulunamadı");
    }
    fs.unlinkSync(pdksEntry.dosyaYolu); // "uploads" klasöründen sil
    await Pdks.deleteMany({ dosyaAdi });

    // Başarı durumunda güncellenmiş verileri gönder
    const pdksData = await Pdks.find({});
    res.send(pdksData);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = router;