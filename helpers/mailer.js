const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'admin@zarluxury.com',
    pass: 'Zara#24Admin'
  }
});

const sent_otp = async (otp, usermail, name) => {
  try {
    const mailOptions = {
      from: 'admin@zarluxury.com',
      to: usermail,
      subject: 'Your ZAR Luxury OTP/Passcode',
      html: `
            <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ZAR Luxury – You're the ONE</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Red+Rose:wght@300&display=swap');
    body {
      font-family: 'Red Rose', sans-serif;
      background-color: #1a1a1a;
      margin: 0;
      padding: 0;
      color: #fff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #2a2a2a;
      border: 1px solid #444;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
    .header {
      background-color: #333;
      color: #fff;
      padding: 10px 0;
      text-align: center;
    }
    .content {
      padding: 20px;
      line-height: 1.6;
    }
    .passcode {
      font-size: 24px;
      font-weight: bold;
      color: #fff;
      background-color: #333;
      padding: 10px;
      border: 1px solid #555;
      text-align: center;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 10px;
      font-size: 12px;
      color: #bbb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to ZAR Luxury</h1>
      <p>You're the ONE</p>
    </div>
    <div class="content">
      <p>Dear <span class="name">${name}</span>,</p>
      <p>Welcome to the distinguished circle of ZAR Luxury, where luxury meets exclusivity.</p>
      <p>Your membership has been successfully activated, and we are pleased to provide you with your unique passcode key. This key is your gateway to a realm of unparalleled elegance and bespoke experiences.</p>
      <div class="passcode">
        ${otp}
      </div>
      <p>With this key, you can unlock a world designed for the discerning few—offering you access to carefully curated materials, personalized services, and a network of the finest brands and designers.</p>
      <p>We invite you to step into the world of ZAR, where every detail is crafted to meet your highest expectations. Your journey into a world beyond the ordinary begins now.</p>
      <p>If you have any inquiries or require assistance, our dedicated concierge team is here to serve you. For us, you are not just a member—you are the ONE.</p>
      <p>Regards,</p>
      <p>ZAR Luxury Team</p>
    </div>
    <div class="footer">
      <p>ZAR Luxury - Where Luxury Meets Exclusivity</p>
    </div>
  </div>
</body>
</html>
`
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(error);
  }
}



const sent_welcome_mail = async (useremail, name) => {
  try {
    const mailOptions = {
      from: 'admin@zarluxury.com',
      to: useremail,
      subject: 'Welcome to zar',
      html: `

            
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ZAR Luxury</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Red+Rose:wght@300&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Red+Rose&display=swap');
    body {
      font-family: 'Red Rose', sans-serif;
      font-weight: 300;
      background-color: black;
      color: white;
    }
    .max-w-2xl {
      max-width: 42rem;
      margin-left: auto;
      margin-right: auto;
      padding: 1rem;
    }
    .relative {
      position: relative;
    }
    .absolute {
      position: absolute;
    }
    .inset-0 {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
    .bg-gradient-to-b {
      background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
    }
    .from-black {
      --tw-gradient-from: #000;
      --tw-gradient-to: rgba(0, 0, 0, 0);
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
    }
    .to-blue-600 {
      --tw-gradient-to: #2563eb;
    }
    .h-screen {
      height: 100vh;
    }
    .text-white {
      color: white;
    }
    .overflow-hidden {
      overflow: hidden;
    }
    .object-cover {
      object-fit: cover;
    }
    .object-center {
      object-position: center;
    }
    .w-full {
      width: 100%;
    }
    .h-full {
      height: 100%;
    }
    .bg-gradient-to-b {
      background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
    }
    .from-black {
      --tw-gradient-from: #000;
      --tw-gradient-to: rgba(0, 0, 0, 0);
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
    }
    .via-black-80 {
      --tw-gradient-stops: var(--tw-gradient-from), rgba(0, 0, 0, 0.8), var(--tw-gradient-to);
    }
    .to-transparent {
      --tw-gradient-to: transparent;
    }
    .opacity-100 {
      opacity: 1;
    }
    .top-4 {
      top: 1rem;
    }
    .left-4 {
      left: 1rem;
    }
    .w-auto {
      width: auto;
    }
    .h-16 {
      height: 4rem;
    }
    .z-10 {
      z-index: 10;
    }
    .flex {
      display: flex;
    }
    .flex-col {
      flex-direction: column;
    }
    .justify-center {
      justify-content: center;
    }
    .items-start {
      align-items: flex-start;
    }
    .text-left {
      text-align: left;
    }
    .px-8 {
      padding-left: 2rem;
      padding-right: 2rem;
    }
    .text-5xl {
      font-size: 3rem;
    }
    .font-bold {
      font-weight: bold;
    }
    .leading-tight {
      line-height: 1.25;
    }
    .mb-4 {
      margin-bottom: 1rem;
    }
    .text-lg {
      font-size: 1.125rem;
    }
    .text-gray-300 {
      color: #d1d5db;
    }
    .mb-8 {
      margin-bottom: 2rem;
    }
    .p-6 {
      padding: 1.5rem;
    }
    .rounded-lg {
      border-radius: 0.5rem;
    }
    .shadow-lg {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .text-3xl {
      font-size: 1.875rem;
    }
    .font-semibold {
      font-weight: 600;
    }
    .text-2xl {
      font-size: 1.5rem;
    }
    .text-center {
      text-align: center;
    }
    .grid {
      display: grid;
    }
grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .sm\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    .gap-4 {
      gap: 1rem;
    }
    .max-w-7xl {
      max-width: 80rem;
    }
    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }
    .mt-24 {
      margin-top: 6rem;
    }
    .justify-end {
      justify-content: flex-end;
    }
    .rounded-2xl {
      border-radius: 1rem;
    }
    .pt-40 {
      padding-top: 10rem;
    }
    .bg-gradient-to-t {
      background-image: linear-gradient(to top, var(--tw-gradient-stops));
    }
    .from-gray-900 {
      --tw-gradient-from: #1a202c;
      --tw-gradient-to: rgba(26, 32, 44, 0);
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
    }
    .via-gray-900-40 {
      --tw-gradient-stops: var(--tw-gradient-from), rgba(26, 32, 44, 0.4), var(--tw-gradient-to);
    }
    .text-3xl {
      font-size: 1.875rem;
    }
    .text-sm {
      font-size: 0.875rem;
    }
    .leading-6 {
      line-height: 1.5rem;
    }
    .hover\:text-gray-400:hover {
      color: #9ca3af;
    }
    .mt-12 {
      margin-top: 3rem;
    }
    .text-sm {
      font-size: 0.875rem;
    }
    .text-gray-300 {
      color: #d1d5db;
    }
    .hover\:text-gray-400:hover {
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="max-w-2xl mx-auto p-4">
    <div class="relative bg-gradient-to-b from-black to-blue-600 h-screen text-white overflow-hidden">
      <div class="absolute inset-0">
        <img src="https://images.pexels.com/photos/3701455/pexels-photo-3701455.jpeg?cs=srgb&dl=pexels-bruceclarkinoc-3701455.jpg&fm=jpg" alt="Background Image" class="object-cover object-center w-full h-full" />
        <div class="absolute inset-0 bg-gradient-to-b from-black via-black-80 to-transparent opacity-100"></div>
      </div>
      <!-- Logo Image at Top Right Corner -->
      <div class="absolute top-4 left-4">
        <img src="https://www.zarluxury.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fzar-logos-2.a14a82bb.png&w=128&q=75" alt="Logo" class="w-auto h-16" />
      </div>
      <div class="relative z-10 flex flex-col justify-center items-start h-full text-left px-8">
        <h1 class="text-5xl font-bold leading-tight mb-4">Connecting Excellence</h1>
        <p class="text-lg text-gray-300 mb-8">in Luxury Living and Design</p>
      </div>
    </div>
    <div class="p-6 rounded-lg shadow-lg">
      <h1 class="text-3xl font-bold mb-4">Welcome to ZAR Luxury</h1>
      <p class="text-lg mb-4">Dear <span class="font-semibold">(Name)</span>,</p>
      <p class="text-lg mb-4">Thank you for choosing ZAR Luxury and taking the time to complete your sign-up.</p>
      <p class="text-lg mb-4">We have successfully received your request, and your profile is currently under review. Our team is carefully assessing the details, and we will notify you once the review process is complete.</p>
      <p class="text-lg mb-4">If you have any questions in the meantime, please don’t hesitate to contact us.</p>
      <p class="text-lg">Regards,</p>
      <p class="text-lg font-semibold">ZAR Luxury Team</p>
    </div>
    <h2 class="text-2xl text-center">Our Partners</h2>
    <div class="grid grid-cols-3 gap-4 max-w-7xl mx-auto mt-24">
      <!-- Architect Card -->
      <article class="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 pb-8 pt-40">
        <img src="https://images.pexels.com/photos/157811/pexels-photo-157811.jpeg?cs=srgb&dl=pexels-yentl-jacobs-43020-157811.jpg&fm=jpg" alt="Architects" class="absolute inset-0 h-full w-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900-40"></div>
        <h3 class="z-10 mt-3 text-3xl font-bold text-white">Architects</h3>
        <div class="z-10 gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">Crafting spaces</div>
      </article>
      <!-- Designers Card -->
      <article class="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 pb-8 pt-40">
        <img src="https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg?cs=srgb&dl=pexels-houzlook-3797991.jpg&fm=jpg" alt="Designers" class="absolute inset-0 h-full w-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900-40"></div>
        <h3 class="z-10 mt-3 text-3xl font-bold text-white">Designers</h3>
        <div class="z-10 gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">Shaping aesthetics</div>
      </article>
      <!-- Consultants Card -->
      <article class="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 pb-8 pt-40">
        <img src="https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" alt="Consultants" class="absolute inset-0 h-full w-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900-40"></div>
        <h3 class="z-10 mt-3 text-3xl font-bold text-white">Consultants</h3>
        <div class="z-10 gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">Providing insights</div>
      </article>
    </div>
    <!-- Bottom Heading and Contact Information -->
    <div class="mt-12 text-center">
      <h2 class="text-3xl font-bold mb-4">Curating Finest Design</h2>
      <p class="text-sm text-gray-300">
        <a href="http://www.zarluxury.com" class="hover:text-gray-400">www.zarluxury.com</a> | <a href="mailto:info@zarluxury.com" class="hover:text-gray-400">info@zarluxury.com</a>
      </p>
    </div>
  </div>
</body>
</html>
`
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(error)
  }
}


const sent_payment_mail = async (useremail, payment_link, name) => {
  try {
    const mailOptions = {
      from: 'admin@zarluxury.com',
      to: useremail,
      subject: 'Payment to zar',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Profile Has Been Approved</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Red+Rose:wght@300&display=swap');
    body {
      font-family: 'Red Rose', sans-serif;
      background-color: #1a1a1a;
      margin: 0;
      padding: 0;
      color: #fff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #2a2a2a;
      border: 1px solid #444;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
    .header {
      background-color: #333;
      color: #fff;
      padding: 10px 0;
      text-align: center;
    }
    .content {
      padding: 20px;
      line-height: 1.6;
    }
    .payment-link {
      font-size: 18px;
      font-weight: bold;
      color: #fff;
      background-color: #333;
      padding: 10px;
      border: 1px solid #555;
      text-align: center;
      margin: 20px 0;
      display: block;
      text-decoration: none;
    }
    .footer {
      text-align: center;
      padding: 10px;
      font-size: 12px;
      color: #bbb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Profile Has Been Approved</h1>
    </div>
    <div class="content">
      <p>Dear <span class="name">${name},</p>
      <p>We are pleased to inform you that your profile has been successfully reviewed and approved by our team at ZAR Luxury.</p>
      <p>To complete your registration, please finalize your payment by clicking the link below:</p>
      <a href="${payment_link}" target="_blank" class="payment-link">Complete Your Payment</a>
      <p>We look forward to having you as a valued member of our exclusive network. Should you have any questions or need assistance with the payment process, please feel free to contact us at <a href="mailto:info@zarluxury.com" style="color: #fff;">(Contact Information)</a>.</p>
      <p>Thank you for choosing ZAR Luxury.</p>
      <p>Regards,</p>
      <p>ZAR Luxury Team</p>
    </div>
    <div class="footer">
      <p>ZAR Luxury - Where Luxury Meets Exclusivity</p>
    </div>
  </div>
</body>
</html>`
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  sent_otp,
  sent_payment_mail,
  sent_welcome_mail
}