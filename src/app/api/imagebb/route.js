import { NextResponse } from 'next/server';

export const POST = async (request) => {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return   NextResponse.json({ error: 'Missing IMGBB_API_KEY environment variable.' }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
  }

  try {
    const  arrayBuffer = await file.arrayBuffer();
    const  base64Image = Buffer.from(arrayBuffer).toString('base64');

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {

        'Content-Type': 'application/x-www-form-urlencoded',
         },
         body: new URLSearchParams({ image: base64Image }),

    });


      if (!response.ok) {
      const errorText = await response.text();

      console.error('ImageBB upload response failed:', errorText);
      return NextResponse.json({ error: 'Failed to upload company logo.' }, { status: 502 });
    }


    const result = await response.json();
    return NextResponse.json({ url: result.data.url });
  } catch (error) {
    console.error('ImageBB upload error:', error);
    return NextResponse.json({ error: 'Unable to upload logo.' }, { status: 500 });
  }
};