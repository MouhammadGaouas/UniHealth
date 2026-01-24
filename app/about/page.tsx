import { FaUsers, FaUserMd, FaHospital, FaHistory } from "react-icons/fa";

export default function AboutPage() {
  const stats = [
    { name: 'Patients Served', value: '10k+', icon: <FaUsers className="text-blue-400" size={24} /> },
    { name: 'Full-time Doctors', value: '50+', icon: <FaUserMd className="text-cyan-400" size={24} /> },
    { name: 'Specialities', value: '20+', icon: <FaHospital className="text-purple-400" size={24} /> },
    { name: 'Years of Service', value: '15', icon: <FaHistory className="text-green-400" size={24} /> },
  ];

  const values = [
    { name: 'Compassion', description: 'We treat everyone with kindness and empathy.' },
    { name: 'Excellence', description: 'We strive for the highest quality in care and safety.' },
    { name: 'Integrity', description: 'We act with honesty and adhere to the highest ethical standards.' },
    { name: 'Innovation', description: 'We embrace new technologies to improve patient outcomes.' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] font-sans pt-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-7xl py-12 sm:py-24">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
              About <span className="text-gradient">UniHealth</span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              UniHealth is dedicated to providing accessible and high-quality healthcare services to students and staff. Our mission is to ensure a healthy and thriving university community through comprehensive care and wellness initiatives.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-base font-semibold leading-7 text-white sm:grid-cols-2 md:flex lg:gap-x-10">
              {['Our Values', 'Our Team', 'History', 'Careers'].map((item) => (
                <a key={item} href="#" className="hover:text-blue-400 transition-colors cursor-pointer">
                  {item} <span aria-hidden="true">&rarr;</span>
                </a>
              ))}
            </div>

            <dl className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="flex flex-col-reverse glass p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition-all hover:-translate-y-1">
                  <dt className="text-base leading-7 text-gray-400 mt-2">{stat.name}</dt>
                  <dd className="text-3xl font-bold leading-9 tracking-tight text-white flex items-center justify-between">
                    {stat.value}
                    {stat.icon}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Values Section */}
        <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Our Core Values</h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Built on a foundation of trust and excellence.
            </p>
          </div>
          <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.name}>
                <dt className="font-semibold text-white text-lg mb-2">{value.name}</dt>
                <dd className="text-gray-400">{value.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}