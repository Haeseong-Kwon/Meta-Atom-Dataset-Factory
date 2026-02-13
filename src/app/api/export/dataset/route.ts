import { NextRequest, NextResponse } from 'next/server';
import { SimulationResult } from '@/types/dataset';

/**
 * Dataset Export API
 * 쿼리 스트링에 따라 필터링된 데이터를 CSV 또는 JSONL 형식으로 스트리밍합니다.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const wavelength = searchParams.get('wavelength');
    const material = searchParams.get('material');

    // 실제 환경에서는 Supabase 쿼리를 통해 데이터를 가져옵니다.
    // 여기서는 구조를 보여주기 위한 Mock 데이터를 사용합니다.
    const mockData: Partial<SimulationResult>[] = [
        { id: '1', transmission: 0.95, phase: 3.14, frequency: 193.1, parameters: { radius: 100 }, isValid: true },
        { id: '2', transmission: 0.88, phase: 1.57, frequency: 193.1, parameters: { radius: 110 }, isValid: true },
    ];

    if (format === 'jsonl') {
        const jsonlContent = mockData.map(d => JSON.stringify(d)).join('\n');
        return new NextResponse(jsonlContent, {
            headers: {
                'Content-Type': 'application/x-jsonlines',
                'Content-Disposition': 'attachment; filename="meta_atom_dataset.jsonl"',
            },
        });
    }

    // 기본 포맷: CSV
    const headers = ['id', 'transmission', 'phase', 'frequency', 'isValid', ...Object.keys(mockData[0].parameters || {})];
    const csvContent = [
        headers.join(','),
        ...mockData.map(d => [
            d.id,
            d.transmission,
            d.phase,
            d.frequency,
            d.isValid,
            ...Object.values(d.parameters || {})
        ].join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="meta_atom_dataset.csv"',
        },
    });
}
