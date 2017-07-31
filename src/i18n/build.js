const fs = require("fs");
const path = require("path");

const i18nDir = path.dirname(require.main.filename);
const contentOf = (lang) => {
    const filePath = path.join(i18nDir, `${lang}.json`);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return content;
};

const languages =  [
   "ar", "de", "es", "fr", "id", "it", "pl", "pt", "ru", "th", "vi", "zh_cn", "zh_tw", "ja", "ach"
   // "nl", "zh", 
];

const contents = languages.reduce((obj, lang) => {
        let content = {};
        try{ content = contentOf(lang); } catch(e) { }
        obj[lang] = content;
        return obj;
    }, {});
const ignore = ['download-as', 'share', 'link', 'embed-code' ]; // these are keys have been removed, but we are keeping them in crowdin.

const dictionary = { };
const en = contentOf('en'); 
Object.keys(en).forEach(key => {
    dictionary[key] = [];
    languages.forEach((lang, inx) => {
        dictionary[key][inx] = contents[lang][key] || '';
        if(dictionary[key][inx] === en[key])
            dictionary[key][inx] = '';
    });
});

fs.writeFileSync(path.join(i18nDir, "dictionary.json"), JSON.stringify({languages, dictionary}), "utf-8"); 
