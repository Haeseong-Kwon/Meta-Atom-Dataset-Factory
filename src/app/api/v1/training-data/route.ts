import { NextRequest, NextResponse } from 'next/server';

/**
 * Training Data API (v1)
 * MetaSurface Designer Surrogate 모델 전용 고성능 데이터 피드 엔드포인트
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const include_invalid = searchParams.get('include_invalid') === 'true';
    const limit = parseInt(searchParams.get('limit') || '1000');

    // 실제 연동 시: 
    // 1. Supabase에서 valid=true인 시뮬레이션 결과 추출
    // 2. 모델에 필요한 Tensor 포맷(Flattened Array 등)으로 변환
    // 3. 압축 전송(Gzip) 고려

    const mockPayload = {
        metadata: {
            timestamp: new Date().toISOString(),
            count: 2,
            schema: {
                X: ['radius', 'height'],
                Y: ['phase', 'transmission']
            }
        },
        data: [
            { x: [120, 450], y: [3.14, 0.95] },
            { x: [140, 450], y: [1.57, 0.88] }
        ]
    };

    return NextResponse.json(mockPayload, {
        headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59'
        }
    });
}
