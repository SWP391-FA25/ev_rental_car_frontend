import ProfileStaff from '../pages/ProfileStaff';

export default function StaffProfileLayout() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <main className='container mx-auto px-4 py-8 mt-20'>
        <ProfileStaff />
      </main>
    </div>
  );
}
