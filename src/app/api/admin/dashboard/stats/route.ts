import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/supabase-api-client';

export async function GET(request: NextRequest) {
  try {
    // Get basic statistics for admin dashboard
    const [
      students,
      lecturers,
      internships,
      companies,
      faculties,
      departments
    ] = await Promise.all([
      apiClient.getStudents(),
      apiClient.getLecturers(),
      apiClient.getInternships(),
      apiClient.getCompanies(),
      apiClient.getFaculties(),
      apiClient.getDepartments()
    ]);

    // Count active internships by status
    const activeInternships = internships?.filter(i => 
      i.status === 'IN_PROGRESS' || i.status === 'APPROVED'
    ) || [];

    const pendingInternships = internships?.filter(i => 
      i.status === 'PENDING'
    ) || [];

    const completedInternships = internships?.filter(i => 
      i.status === 'COMPLETED'
    ) || [];
    const stats = {
      totalStudents: students?.length || 0,
      totalLecturers: lecturers?.length || 0,
      totalInternships: internships?.length || 0,
      totalCompanies: companies?.length || 0,
      activeInternships: activeInternships.length,
      totalFaculties: faculties?.length || 0,
      totalDepartments: departments?.length || 0,
      
      // Recent activity (simplified for now)
      recentActivity: [
        {
          id: '1',
          type: 'student_registered',
          message: 'New student registered',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2', 
          type: 'internship_submitted',
          message: 'Internship application submitted',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        }
      ],

      // Chart data for dashboard
      chartData: {
        internshipsByStatus: [
          { status: 'Pending', count: pendingInternships.length },
          { status: 'Active', count: activeInternships.length },
          { status: 'Completed', count: completedInternships.length }
        ],
        studentsByFaculty: faculties?.map(faculty => ({
          faculty: faculty.name,
          count: (students?.filter(student => 
            student.faculty_id === faculty.id
          ) || []).length
        })) || []
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: stats 
    });

  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
