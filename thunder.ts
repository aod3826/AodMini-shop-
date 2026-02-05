import { ThunderVerifyResponse } from '../types';

export async function verifyPaymentSlip(
  imageUrl: string,
  apiKey: string
): Promise<ThunderVerifyResponse> {
  try {
    const response = await fetch(
      import.meta.env.VITE_THUNDER_API_URL || 'https://api.thunder-solution.com/verify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          image_url: imageUrl,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Thunder API request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Thunder API error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
