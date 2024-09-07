// tools/renderTemplate.js
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

// Função para compilar e renderizar templates Handlebars
function renderTemplate(templateName, context, res) {
  const templatePath = path.join(__dirname,"..","templates",`${templateName}.hbs`);

  fs.readFile(templatePath, "utf8", (err, template) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
      return;
    }

    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate(context);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });
}

module.exports = renderTemplate;
