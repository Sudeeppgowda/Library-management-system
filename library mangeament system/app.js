// BookNest uses browser Local Storage. No server or database installation is needed.
const $=id=>document.getElementById(id);
const KEYS={users:"booknest_users",books:"booknest_books",records:"booknest_records",session:"booknest_session"};
let currentUser=null;
function read(key,fallback=[]){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function write(key,value){localStorage.setItem(key,JSON.stringify(value))}
function seed(){
 let users=read(KEYS.users);
 if(!users.some(u=>u.email==="admin@library.com"))users.push({id:"admin-1",name:"Library Admin",email:"admin@library.com",password:"Admin@123",role:"admin"});
 write(KEYS.users,users);
 if(!localStorage.getItem(KEYS.books))write(KEYS.books,[
 {id:1,title:"Wings of Fire",author:"A. P. J. Abdul Kalam",category:"Biography",isbn:"9788173711466",total:4,available:4},
 {id:2,title:"The Alchemist",author:"Paulo Coelho",category:"Fiction",isbn:"9780061122415",total:3,available:3},
 {id:3,title:"Introduction to Algorithms",author:"Thomas H. Cormen",category:"Computer Science",isbn:"9780262046305",total:2,available:2},
 {id:4,title:"Database System Concepts",author:"Abraham Silberschatz",category:"Computer Science",isbn:"9780078022159",total:3,available:3},
 {id:5,title:"The Guide",author:"R. K. Narayan",category:"Fiction",isbn:"9780140185677",total:2,available:2}
 ]);
 if(!localStorage.getItem(KEYS.records))write(KEYS.records,[]);
}
function escapeHTML(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function message(id,text,error=false){$(id).textContent=text;$(id).style.color=error?"#c0392b":"#16845b"}
function showTab(tab){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));$("loginForm").classList.toggle("hidden",tab!=="login");$("registerForm").classList.toggle("hidden",tab!=="register");message("authMsg","")}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>showTab(b.dataset.tab)));
function loginUser(user){currentUser={id:user.id,name:user.name,email:user.email,role:user.role};write(KEYS.session,currentUser);showDashboard()}
function showDashboard(){
 $("authView").classList.add("hidden");$("appView").classList.remove("hidden");$("userBadge").textContent=currentUser.name;
 $("welcomeTitle").textContent=`Hello, ${currentUser.name}!`;$("subtitle").textContent=currentUser.role==="admin"?"Administrator workspace":"Welcome to your student library";
 $("adminPanel").classList.toggle("hidden",currentUser.role!=="admin");$("historyTitle").textContent=currentUser.role==="admin"?"All borrowing records":"My borrowing history";render();
}
$("registerForm").addEventListener("submit",e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));let users=read(KEYS.users);const email=data.email.trim().toLowerCase();if(users.some(u=>u.email===email))return message("authMsg","Email already registered.",true);if(data.password.length<6)return message("authMsg","Password must contain at least 6 characters.",true);const user={id:"u"+Date.now(),name:data.name.trim(),email,password:data.password,role:"student"};users.push(user);write(KEYS.users,users);e.target.reset();loginUser(user)});
$("loginForm").addEventListener("submit",e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));const user=read(KEYS.users).find(u=>u.email===data.email.trim().toLowerCase()&&u.password===data.password);if(!user)return message("authMsg","Incorrect email or password.",true);loginUser(user)});
$("logoutBtn").onclick=()=>{localStorage.removeItem(KEYS.session);currentUser=null;$("appView").classList.add("hidden");$("authView").classList.remove("hidden");$("userBadge").textContent=""};
$("bookForm").addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const books=read(KEYS.books);if(d.isbn&&books.some(b=>b.isbn===d.isbn))return message("bookMsg","That ISBN already exists.",true);const n=Number(d.copies);if(!Number.isInteger(n)||n<1)return message("bookMsg","Enter at least one copy.",true);books.push({id:Date.now(),title:d.title.trim(),author:d.author.trim(),category:d.category.trim(),isbn:d.isbn.trim(),total:n,available:n});write(KEYS.books,books);e.target.reset();message("bookMsg","Book added successfully.");render()});
$("searchInput").addEventListener("input",renderBooks);
function render(){
 const books=read(KEYS.books),records=read(KEYS.records);
 $("bookCount").textContent=books.length;$("availableCount").textContent=books.reduce((s,b)=>s+b.available,0);
 $("recordCount").textContent=currentUser.role==="admin"?records.filter(r=>r.status==="Borrowed").length:records.filter(r=>r.userId===currentUser.id).length;
 renderBooks(books);renderHistory(records);
}
function renderBooks(books){
 const q=$("searchInput").value.toLowerCase();const filtered=books.filter(b=>(b.title+" "+b.author+" "+b.category).toLowerCase().includes(q));
 $("bookList").innerHTML=filtered.length?filtered.map(b=>`<article class="book"><div class="bookTop"><div><h3>${escapeHTML(b.title)}</h3><p>By ${escapeHTML(b.author)} · ${escapeHTML(b.category)}</p><p>ISBN: ${escapeHTML(b.isbn||"Not provided")} · ${b.available}/${b.total} available</p></div><span class="pill">${b.available?"Available":"Out of stock"}</span></div>${currentUser.role==="admin"?`<button class="outline" onclick="deleteBook(${b.id})">Delete book</button>`:`<button class="primary" ${b.available<1?"disabled":""} onclick="borrowBook(${b.id})">Borrow book</button>`}</article>`).join(""):'<p class="muted">No books found.</p>';
}
function renderHistory(records){
 const visible=currentUser.role==="admin"?records:records.filter(r=>r.userId===currentUser.id);
 $("historyList").innerHTML=visible.length?visible.sort((a,b)=>b.borrowedAt-a.borrowedAt).map(r=>`<article class="record"><strong>${escapeHTML(r.bookTitle)}</strong><p>By ${escapeHTML(r.author)}${currentUser.role==="admin"?" · Student: "+escapeHTML(r.studentName):""}</p><p>Borrowed: ${new Date(r.borrowedAt).toLocaleDateString()} · Due: ${new Date(r.dueDate).toLocaleDateString()}</p><p>Status: <b>${r.status}</b></p>${r.status==="Borrowed"?`<button class="outline" onclick="returnBook('${r.id}')">Mark as returned</button>`:""}</article>`).join(""):'<p class="muted">No borrowing records yet.</p>';
}
function borrowBook(id){
 if(currentUser.role!=="student")return alert("Log in as a student to borrow books.");
 const books=read(KEYS.books),book=books.find(b=>b.id===id);if(!book||book.available<1)return alert("This book is unavailable.");
 const records=read(KEYS.records);if(records.some(r=>r.userId===currentUser.id&&r.bookId===id&&r.status==="Borrowed"))return alert("You have already borrowed this book.");
 const now=new Date(),due=new Date();due.setDate(due.getDate()+14);book.available--;records.push({id:"r"+Date.now(),userId:currentUser.id,studentName:currentUser.name,bookId:id,bookTitle:book.title,author:book.author,borrowedAt:now.getTime(),dueDate:due.toISOString(),status:"Borrowed"});write(KEYS.books,books);write(KEYS.records,records);alert("Book borrowed! Please return it within 14 days.");render();
}
function returnBook(recordId){
 const records=read(KEYS.records),record=records.find(r=>r.id===recordId&&r.status==="Borrowed");if(!record)return alert("Active borrowing record not found.");
 if(currentUser.role!=="admin"&&record.userId!==currentUser.id)return alert("You cannot return another student's book.");
 record.status="Returned";record.returnedAt=Date.now();const books=read(KEYS.books),book=books.find(b=>b.id===record.bookId);if(book)book.available=Math.min(book.total,book.available+1);write(KEYS.records,records);write(KEYS.books,books);render();
}
function deleteBook(id){
 const records=read(KEYS.records);if(records.some(r=>r.bookId===id&&r.status==="Borrowed"))return alert("Cannot delete a book while it is borrowed.");
 if(!confirm("Delete this book from the catalogue?"))return;write(KEYS.books,read(KEYS.books).filter(b=>b.id!==id));render();
}
seed();const saved=read(KEYS.session,null);if(saved){const user=read(KEYS.users).find(u=>u.id===saved.id);if(user)loginUser(user)}
