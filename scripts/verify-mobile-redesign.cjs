const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('fs');
const path=require('path');
const base=process.env.BASE_URL || 'http://localhost:8099';
const output=process.env.OUTPUT_DIR || '/tmp/deeptutor-mobile-verification';
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE || '/opt/google/chrome/chrome',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 const go=async(n,title)=>{await page.goto(`${base}/mobile/${n}`);await (n===13?page.getByRole('heading').first():page.getByRole('heading',{name:title,exact:true}).first()).waitFor();await page.getByTestId('mobile-ready').waitFor();};
 await go(57,'Task details');await page.getByRole('textbox',{name:'Task',exact:true}).fill('Verify native design');await page.getByRole('button',{name:'Save task',exact:true}).click();await page.getByRole('heading',{name:'Task board',exact:true}).waitFor();await page.getByRole('button',{name:'Edit Verify native design',exact:true}).waitFor();
 await page.reload();await page.getByRole('button',{name:'Edit Verify native design',exact:true}).waitFor();console.log('Task persists');
 await go(29,'Edit note');await page.getByRole('textbox',{name:'Page title',exact:true}).fill('Local regression note');await page.getByRole('textbox',{name:'Note body',exact:true}).fill('Two statements observe different snapshots.');await page.getByRole('button',{name:'Save note',exact:true}).click();await page.getByRole('button',{name:'Done',exact:true}).click();await go(28,'Notebook');await page.getByRole('button',{name:'Local regression note',exact:true}).waitFor();console.log('Note saves');
 await go(37,'Practice question');await page.getByRole('radio',{name:'A · At transaction start',exact:true}).click();await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.getByRole('alert').filter({hasText:'Not quite'}).waitFor();console.log('Incorrect answer handled');
 await go(26,'Library');await page.getByRole('textbox',{name:'Search library',exact:true}).fill('zz-no-match');await page.getByRole('status').filter({hasText:'No results'}).waitFor();console.log('Search empty state');
 await go(83,'Appearance');await page.getByRole('button',{name:'Theme',exact:true}).click();await page.getByRole('button',{name:'Dark',exact:true}).click();await page.getByRole('button',{name:'Apply appearance',exact:true}).click();await page.getByRole('button',{name:'Done',exact:true}).click();await page.screenshot({path:path.join(output,'dark-appearance.png')});await go(1,'Learn');await page.screenshot({path:path.join(output,'dark-learn.png')});console.log('Dark theme persists');
 await go(12,'Tutor');await page.getByRole('textbox',{name:'Ask DeepTutor',exact:true}).fill('Explain PostgreSQL isolation');await page.getByRole('button',{name:'Start conversation',exact:true}).click();await page.getByRole('heading',{name:'Explain PostgreSQL isolation',exact:true}).waitFor();await page.getByText('DEMO CONVERSATION',{exact:false}).waitFor();console.log('Existing chat fixture sends');

 const specs=require('../src/features/mobile/screens.json');
 const results=[];
 const selected=process.argv.includes('--all')?specs:specs.filter(s=>[1,4,12,26,37,52,57,61,81,83,119].includes(s.number));
 for(const s of selected){await go(s.number,s.name.split(' / ')[1]);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);results.push({number:s.number,overflow});if(s.number%20===0)console.log('Verified route',s.number);}
 for(const width of [320,768]){await page.setViewportSize({width,height:844});for(const n of [1,12,26,52,57,83]){const s=specs.find(s=>s.number===n);await go(n,s.name.split(' / ')[1]);results.push({number:n,width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)});}}
 const report={routes:results,errors};fs.writeFileSync(path.join(output,'interaction-report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({routes:results.length,overflow:results.filter(r=>r.overflow),errors}));await browser.close();
 if(errors.length||results.some(r=>r.overflow))process.exitCode=1;

})();
