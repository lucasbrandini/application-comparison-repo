// tools/renderTemplate.js
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

// Função para compilar e renderizar templates Handlebars
function renderTemplate(templateName, context, res) {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    `${templateName}.hbs`
  );

  fs.readFile(templatePath, "utf8", (err, template) => {
    if (err) {
      console.error("Erro ao ler o template:", err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Erro ao carregar o template.");
      return;
    }

    try {
      const compiledTemplate = Handlebars.compile(template);
      const html = compiledTemplate(context);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    } catch (compileErr) {
      console.error("Erro ao compilar o template:", compileErr);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Erro ao compilar o template.");
    }
  });
}

module.exports = renderTemplate;
