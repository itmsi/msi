import Avatar from '@/components/common/Avatar';
import { generateInitials, generateAvatarColor } from '@/utils/avatarHelper';

export default function AvatarDemoPage() {
  // Sample data
  const users = [
    { id: 1, name: "John Doe Smith", avatar: "https://valid-image-url.jpg" },
    { id: 2, name: "Maria Garcia", avatar: null },
    { id: 3, name: "Ahmad Rizki", avatar: "https://broken-url.jpg" },
    { id: 4, name: "Siti Nurhaliza", avatar: "" },
    { id: 5, name: "Budi", avatar: undefined },
    { id: 6, name: "Catherine Johnson", avatar: "https://picsum.photos/200" },
    { id: 7, name: "Muhammad Abdullah", avatar: null },
    { id: 8, name: "Sarah Connor", avatar: "https://picsum.photos/300" },
  ];

  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Avatar Helper Demo</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Demonstrasi Avatar Helper yang otomatis handle fallback ke initials jika image broken atau tidak tersedia.
          Warna avatar di-generate secara konsisten berdasarkan nama.
        </p>
      </div>

      {/* Avatar Grid - Different Sizes */}
      <section className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Different Sizes</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <Avatar src={null} nama="Small" size={32} />
            <p className="mt-2 text-sm text-gray-600">32px</p>
          </div>
          <div className="text-center">
            <Avatar src={null} nama="Medium" size={48} />
            <p className="mt-2 text-sm text-gray-600">48px</p>
          </div>
          <div className="text-center">
            <Avatar src={null} nama="Default" size={64} />
            <p className="mt-2 text-sm text-gray-600">64px</p>
          </div>
          <div className="text-center">
            <Avatar src={null} nama="Large" size={96} />
            <p className="mt-2 text-sm text-gray-600">96px</p>
          </div>
          <div className="text-center">
            <Avatar src={null} nama="XLarge" size={128} />
            <p className="mt-2 text-sm text-gray-600">128px</p>
          </div>
        </div>
      </section>

      {/* Sample Users */}
      <section className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Sample Users (Mixed Image States)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {users.map((user) => (
            <div key={user.id} className="text-center">
              <Avatar
                src={user.avatar}
                nama={user.name}
                size={80}
                className="mx-auto"
              />
              <p className="mt-3 text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">
                {user.avatar ? 'Has Image' : 'No Image'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* With Borders & Styles */}
      <section className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Styling Examples</h2>
        <div className="flex flex-wrap items-center gap-8">
          <div className="text-center">
            <Avatar
              src={null}
              nama="Simple"
              size={80}
            />
            <p className="mt-2 text-sm text-gray-600">Default</p>
          </div>
          
          <div className="text-center">
            <Avatar
              src={null}
              nama="Border"
              size={80}
              className="border-4 border-white shadow-lg"
            />
            <p className="mt-2 text-sm text-gray-600">With Border</p>
          </div>
          
          <div className="text-center">
            <Avatar
              src={null}
              nama="Ring"
              size={80}
              className="ring-4 ring-blue-500/30"
            />
            <p className="mt-2 text-sm text-gray-600">With Ring</p>
          </div>
          
          <div className="text-center">
            <Avatar
              src={null}
              nama="Combined"
              size={80}
              className="border-4 border-white shadow-xl ring-2 ring-green-500/40"
            />
            <p className="mt-2 text-sm text-gray-600">Combined</p>
          </div>
        </div>
      </section>

      {/* Helper Functions Demo */}
      <section className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Helper Functions Demo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.slice(0, 6).map((user) => {
            const initials = generateInitials(user.name);
            const color = generateAvatarColor(user.name);
            
            return (
              <div key={user.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4 mb-3">
                  <Avatar src={user.avatar} nama={user.name} size={60} />
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">Initials: {initials}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-gray-600">Color: {color}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Code Examples */}
      <section className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Code Examples</h2>
        <div className="space-y-6">
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Basic Usage</h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`<Avatar
  src={employee.employee_foto}
  nama={employee.employee_name}
/>`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">With Custom Size & Styling</h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`<Avatar
  src={user.avatar}
  nama={user.fullName}
  size={120}
  className="border-4 border-white shadow-lg"
/>`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Helper Functions</h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { generateInitials, generateAvatarColor } from '@/utils/avatarHelper';

const initials = generateInitials("John Doe Smith"); // "JS"
const color = generateAvatarColor("John Doe"); // "#3B82F6"`}
            </pre>
          </div>

        </div>
      </section>

    </div>
  );
}