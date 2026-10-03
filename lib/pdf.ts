// A compact, dependency-free PDF writer for English project documentation.
// Text is escaped, wrapped and paginated; byte offsets are computed on the final stream.
export function projectPdf(sections:{title:string,lines:string[]}[],project:string){
 const pages:string[][]=[];let current:string[]=[];let y=744;
 const ascii=(s:string)=>s.replace(/[→–—]/g,' - ').replace(/[^\x20-\x7e]/g,' ');
 const escape=(s:string)=>ascii(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
 function flush(){if(current.length){pages.push(current);current=[];y=744;}}
 function line(text:string,size=10,color='0.16 0.22 0.32'){if(y<60)flush();current.push(`${color} rg BT /F1 ${size} Tf 48 ${y} Td (${escape(text)}) Tj ET`);y-=Math.max(13,size+6);}
 function wrap(s:string){for(const paragraph of s.split(/\r?\n/)){const words=ascii(paragraph).split(/\s+/);let text='';for(let word of words){while(word.length>94){if(text){line(text);text='';}line(word.slice(0,94));word=word.slice(94);}if((text+' '+word).length>94){line(text);text=word;}else text+=(text?' ':'')+word;}line(text);}}
 line('ICVSP',24,'0.08 0.16 0.3');line('Project history & documentation',18,'0.12 0.32 0.7');line('');wrap(project);line('');wrap('Generated '+new Date().toISOString());wrap('This report reflects the saved project records at the time of export.');line('');line('CONTENTS',14);sections.forEach((s,i)=>wrap(`${i+1}. ${s.title}`));flush();
 sections.forEach((s,i)=>{if(current.length>34)flush();line(`${i+1}. ${s.title}`,15,'0.08 0.2 0.4');line('');for(const l of s.lines)wrap(l);line('');});flush();
 const objects:string[]=[];const add=(s:string)=>{objects.push(s);return objects.length;};add('<< /Type /Catalog /Pages 2 0 R >>');add('');const font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');const kids:number[]=[];
 pages.forEach((commands,i)=>{const footer=`0.4 0.45 0.55 rg BT /F1 9 Tf 48 28 Td (ICVSP - Project documentation | Page ${i+1} of ${pages.length}) Tj ET`;const stream=`0.06 0.12 0.23 rg 0 784 612 8 re f\n${commands.join('\n')}\n${footer}\n`;const content=add(`<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}endstream`);kids.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${content} 0 R >>`));});objects[1]=`<< /Type /Pages /Kids [${kids.map(k=>k+' 0 R').join(' ')}] /Count ${kids.length} >>`;
 let result='%PDF-1.4\n';const offsets=[0];objects.forEach((o,i)=>{offsets.push(new TextEncoder().encode(result).length);result+=`${i+1} 0 obj\n${o}\nendobj\n`;});const xref=new TextEncoder().encode(result).length;result+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;offsets.slice(1).forEach(o=>result+=`${String(o).padStart(10,'0')} 00000 n \n`);result+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;return new TextEncoder().encode(result);
}
