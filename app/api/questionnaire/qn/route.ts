import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.HELLOPRO_API_URL || 'https://www.hellopro.fr';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rubriqueId = searchParams.get('rubrique_id');
    const q1Answer = searchParams.get('q1_answer');

    if (!rubriqueId || !q1Answer) {
      return NextResponse.json(
        { error: 'rubrique_id and q1_answer required' },
        { status: 400 }
      );
    }

    const url = new URL(`${BASE_URL}/api/questionnaire/path.php`);
    url.searchParams.append('rubrique_id', rubriqueId);
    url.searchParams.append('q1_answer', q1Answer);

    console.log('Calling Questionnaire Qn API:', url.toString());

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
    console.error('Questionnaire Qn proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
