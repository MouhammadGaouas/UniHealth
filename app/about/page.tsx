export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">About Us</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            UniHealth is dedicated to providing accessible and high-quality healthcare services to students and staff. Our mission is to ensure a healthy and thriving university community through comprehensive care and wellness initiatives.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-base font-semibold leading-7 text-gray-900 dark:text-white sm:grid-cols-2 md:flex lg:gap-x-10">
            <a href="#">Our Values <span aria-hidden="true">&rarr;</span></a>
            <a href="#">Our Team <span aria-hidden="true">&rarr;</span></a>
            <a href="#">History <span aria-hidden="true">&rarr;</span></a>
            <a href="#">Careers <span aria-hidden="true">&rarr;</span></a>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col-reverse">
              <dt className="text-base leading-7 text-gray-600 dark:text-gray-300">Patients Served</dt>
              <dd className="text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">10k+</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-base leading-7 text-gray-600 dark:text-gray-300">Full-time Doctors</dt>
              <dd className="text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">50+</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-base leading-7 text-gray-600 dark:text-gray-300">Specialities</dt>
              <dd className="text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">20+</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-base leading-7 text-gray-600 dark:text-gray-300">Years of Service</dt>
              <dd className="text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">15</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}