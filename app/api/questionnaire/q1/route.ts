import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.HELLOPRO_API_URL || 'https://www.hellopro.fr';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rubriqueId = searchParams.get('rubrique_id');

    if (!rubriqueId) {
      return NextResponse.json(
        { error: 'rubrique_id required' },
        { status: 400 }
      );
    }

    const url = new URL(`${BASE_URL}/api/questionnaire/entry.php`);
    url.searchParams.append('rubrique_id', rubriqueId);

    console.log('Calling Questionnaire Q1 API:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Questionnaire Q1 proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
