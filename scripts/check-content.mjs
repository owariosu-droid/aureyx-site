import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
const roots=["app","components","data","lib"], files=[];
const walk=(dir)=>readdirSync(dir).forEach((name)=>{const path=join(dir,name); if(statSync(path).isDirectory()) walk(path); else files.push(path);});
roots.forEach((root)=>walk(root));
const missing=[];
for(const file of files.filter((file)=>[".ts",".tsx"].includes(extname(file)))){
  const text=readFileSync(file,"utf8");
  for(const match of text.matchAll(/["'`](\/(?!\/)[^"'`?#]+\.(?:png|jpe?g|webp|gif|svg|m4a|wav))["'`]/gi)) if(!match[1].includes("${") && !existsSync(join("public",match[1]))) missing.push(`${file}: ${match[1]}`);
}
if(missing.length){console.error(`Missing public assets:\n${missing.join("\n")}`);process.exit(1)}
console.log("Content asset references are valid.");
