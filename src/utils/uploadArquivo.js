import multer from "multer";

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploadsTemp");
  },
  filename: function (req, file, cb) {
    // Extração da extensão do arquivo original:
    const extensaoArquivo = file.originalname.split(".")[1];

    // Cria um código randômico que será o nome do arquivo
    const novoNomeArquivo = "demandasDb";

    // Indica o novo nome do arquivo:
    cb(null, `${novoNomeArquivo}.${extensaoArquivo}`);
  }
});

const upload = multer({ storage });

export default upload;