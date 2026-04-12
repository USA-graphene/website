const { NextResponse } = require('next/server');
console.log(NextResponse.redirect('https://example.com', 301).status);
