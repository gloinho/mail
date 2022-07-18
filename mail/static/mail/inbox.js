document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', ()=>{compose_email('','','')});
  document.querySelector('form').onsubmit = send_email
  load_mailbox('inbox')

});

function compose_email(recipients, subject, body) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipients;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;
};

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // Show all emails
  if (mailbox === 'inbox'){
    inbox_emails()
  } 
  //Show sent emails
  else if(mailbox === 'sent'){
    sent_emails()
  }
  else if (mailbox === 'archive'){
    archived_emails()
  }
  
};

function one_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      // ... do something else with email ...
      load_mailbox(`${email.subject}`) 
      detail_email(email)
  });
};

function detail_email(email){
  user = document.getElementById('user').innerText
  if(email.sender !== user){
    button_archive(email)
    button_reply(email)
  }
  const column_email = document.createElement('div')
  const subject = document.createElement('div')
  column_email.className = 'col info'
  subject.className = 'col subject'
  document.querySelector("#emails-view").appendChild(column_email)
  document.querySelector("#emails-view").appendChild(subject)
  for (let info in email){
    if (info === 'sender'){
      const div_info = document.createElement('div')
        div_info.innerHTML = `<b>${info.charAt(0).toUpperCase() + info.slice(1)}</b>: ${email[info]}`
        div_info.className = 'row'
        column_email.appendChild(div_info) 
    }
    else if (info === 'recipients'){
      const div_info = document.createElement('div')
      div_info.innerHTML = `<b>${info.charAt(0).toUpperCase() + info.slice(1)}</b>: ${email[info]}`
      div_info.className = 'row'
      column_email.appendChild(div_info) 
    } else if( info === 'subject') {
      const div_info = document.createElement('div')
      div_info.innerHTML = `<b>${info.charAt(0).toUpperCase() + info.slice(1)}</b>: ${email[info]}`
      div_info.className = 'row'
      column_email.appendChild(div_info) 
    } else if( info === 'timestamp'){
      const div_info = document.createElement('div')
      div_info.innerHTML= `<b>${info.charAt(0).toUpperCase() + info.slice(1)}</b>: ${email[info]}`
      div_info.className = 'row text-muted'
      column_email.appendChild(div_info)
    } else if (info === 'body'){
      const div_info = document.createElement('div')
      div_info.className = 'row'
      div_info.innerText= `${email[info]}`
      subject.appendChild(div_info)
    }
    else if (info === 'read'){
      email_read(email)
    }
  }
};

function email_archive(email){
  if (email.archived){
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body:JSON.stringify({
        archived:false
      })
    })
    .then(alert('Unarchived'))
    .then(load_mailbox('inbox'))
  } else {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body:JSON.stringify({
        archived:true
      })
    })
    .then(alert('Archived'))
    .then(load_mailbox('inbox'))
  }  
};

function button_reply(email){
  const button = document.createElement('button')
  button.style.marginBottom = '5px'
  button.style.marginLeft = '5px'
  button.innerText = 'Reply'
  button.className = 'btn btn-info'
  let body = ''
  if(email.body.startsWith('->')){
    let replies = email.body.match((/^->.+;/gm))
    for (reply in replies){
      body += `${replies[reply]}\n`
    }
    let new_body = email.body.match(/^[^->].+$/gm)
    body += `-> On ${email.timestamp} ${email.sender} wrote: "${new_body}";\n`
  } else{body=`-> On ${email.timestamp} ${email.sender} wrote: "${email.body}";\n`}
  button.addEventListener('click', () => {
    if(email.subject.slice(0,3)==='Re:'){
      compose_email(email.sender, email.subject, body)
    } else{
      compose_email(email.sender,'Re: '+email.subject, body)
    }
  })
  document.querySelector("#emails-view").appendChild(button) 
}

function button_archive(email){
  const archive_email = document.createElement('button')
  archive_email.style.marginBottom = '5px'
  if (email.archived){
    archive_email.innerText = 'Unarchive Email'
    archive_email.className = 'btn btn-danger'
  } else {
    archive_email.innerText = 'Archive Email'
    archive_email.className = 'btn btn-info'
  }
  
  archive_email.addEventListener('click', () => {email_archive(email)})
  document.querySelector("#emails-view").appendChild(archive_email) 
};

function see_inbox_emails(emails){
  for (const email of emails){
    const divemail = document.createElement('button')
    divemail.className = 'noread row btn-sm btn-light btn-block email'
    for (const info in email){
      if (info ==='read'){
        if (email[info])
        divemail.classList.remove('btn-light')
        divemail.classList.add('btn-secondary')
      }
      if (info === 'sender'){
        const div_info = document.createElement('span')
        div_info.innerHTML = `${email[info]}`
        div_info.style.float = 'left'
        div_info.style.fontWeight = 'bold'
        divemail.appendChild(div_info)
      } else if (info === 'subject'){
        const div_info = document.createElement('span')
        div_info.innerText = email[info]
        divemail.appendChild(div_info)
      } else if (info === 'timestamp'){
        const div_info = document.createElement('span')
        div_info.innerText = email[info]
        div_info.style.float = 'right'
        divemail.appendChild(div_info)
      }
    }
    divemail.addEventListener('click', () => {one_email(email.id)})
    document.querySelector('.col.emails').appendChild(divemail)
  };
};

function inbox_emails(){
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
    // Print emails
    // ... do something else with emails ...
    const column_email = document.createElement('div')
    column_email.className = 'col emails'
    document.querySelector("#emails-view").appendChild(column_email)
    title('inbox')
    see_inbox_emails(emails)
  });
};

function sent_emails(){
  fetch('/emails/sent')
  .then(response => response.json())
  .then(emails =>{
    // Print emails 
    console.log(emails)
    const column_email = document.createElement('div')
    column_email.className = 'col emails'
    document.querySelector("#emails-view").appendChild(column_email)
    title('sent')
    see_sent_emails(emails)
  })
};

function see_sent_emails(emails){
  for (const email of emails){
    const divemail = document.createElement('button')
    divemail.className = 'noread row btn-sm btn-light btn-block email'
    for (const info in email){
      if (info ==='read'){
        if (email[info])
        divemail.classList.remove('btn-light')
        divemail.classList.add('btn-secondary')
      }
      if (info === 'recipients'){
        const div_info = document.createElement('span')
        div_info.innerHTML = `${email[info]}`
        div_info.style.float = 'left'
        div_info.style.fontWeight = 'bold'
        divemail.appendChild(div_info)
      } else if (info === 'subject'){
        const div_info = document.createElement('span')
        div_info.innerText = email[info]
        divemail.appendChild(div_info)
      } else if (info === 'timestamp'){
        const div_info = document.createElement('span')
        div_info.innerText = email[info]
        div_info.style.float = 'right'
        divemail.appendChild(div_info)
      }
    }
    divemail.addEventListener('click', () => {one_email(email.id)})
    document.querySelector('.col.emails').appendChild(divemail)
  };
};

function archived_emails(){
  fetch('/emails/archive')
  .then(response => response.json())
  .then(emails =>{
    // Print emails 
    console.log(emails)
    const column_email = document.createElement('div')
    column_email.className = 'col emails'
    document.querySelector("#emails-view").appendChild(column_email)
    title('inbox')
    see_inbox_emails(emails)
  })
};

function send_email(){
  const c_recipients = document.querySelector('#compose-recipients').value;
  const c_subject = document.querySelector('#compose-subject').value;
  const c_body = document.querySelector('#compose-body').value;
  let alert = document.createElement('div')
  alert.setAttribute('role','alert')
 fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: c_recipients,
        subject: c_subject,
        body: c_body
    })
  })
  .then(response => response.json())
  .then(result => { 
    if(result.message){
      alert.className = 'alert alert-success alert-dismissible fade show'
      alert.innerText = result.message
      document.querySelector('#emails-view').appendChild(alert)
    } else {
      alert.className = 'alert alert-danger alert-dismissible fade show'
      alert.innerText = result.error
      document.querySelector('#emails-view').appendChild(alert)
    }   
  });
  load_mailbox('sent')
  return false
};

function alert_callback(result){
  if(result.message){
    alert(result.message)
  } else{alert(result.error)} 
}

function email_read(email){
  fetch(`/emails/${email.id}`, {
    method:'PUT',
    body: JSON.stringify({
      read:true
    })
  })
}

function title(path){
  const title = document.createElement('div')
  title.id = 'title'
  title.className = 'row title text-center'
  document.querySelector('.col.emails').appendChild(title)
  if (path ==='inbox'){
    const col1 = document.createElement('div')
    col1.className = 'title col-2'
    col1.innerText = 'Sent by'
    const col2 = document.createElement('div')
    col2.className = 'title col-8'
    col2.innerText = 'Subject'
    const col3 = document.createElement('div')
    col3.className = 'title col-2'
    col3.innerText = 'Date'
    title.appendChild(col1)
    title.appendChild(col2)
    title.appendChild(col3)
  } else if (path === 'sent'){
    const col1 = document.createElement('div')
    col1.className = 'title col-2'
    col1.innerText = 'Sent for'
    const col2 = document.createElement('div')
    col2.className = 'title col-8'
    col2.innerText = 'Subject'
    const col3 = document.createElement('div')
    col3.className = 'title col-2'
    col3.innerText = 'Date'
    title.appendChild(col1)
    title.appendChild(col2)
    title.appendChild(col3)

  }
}