import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Training Data API (v1)
 * MetaSurface Designer Surrogate 모델 전용 고성능 데이터 피드 엔드포인트
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    try {
        const { data: results, error, count } = await supabase
            .from('meta_atom_dataset')
            .select('transmission, phase, parameters, frequency', { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Surrogate 모델에 적합한 포맷으로 변환
        const formattedData = results.map(r => ({
            x: [
                r.parameters.radius || 0,
                r.parameters.height || 0,
                r.parameters.width || 0,
                r.parameters.gap || 0,
                r.parameters.period || 0,
                r.frequency || 0
            ],
            y: [
                r.phase || 0,
                r.transmission || 0
            ]
        }));

        const payload = {
            metadata: {
                timestamp: new Date().toISOString(),
                total_samples: count || 0,
                batch_size: results.length,
                schema: {
                    X: ['radius', 'height', 'width', 'gap', 'period', 'frequency'],
                    Y: ['phase', 'transmission']
                },
                normalization: "standard-scaler"
            },
            data: formattedData
        };

        return NextResponse.json(payload, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
                'Access-Control-Allow-Origin': '*' // Allow cross-origin for surrogate model tools
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
