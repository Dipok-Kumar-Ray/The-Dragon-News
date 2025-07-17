import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FaGoogle, 
  FaFileAlt, 
  FaShieldAlt, 
  FaRocket, 
  FaUsers,
  FaCopy,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { useGoogleDocsStore } from '../store/googleDocsStore';
import toast from 'react-hot-toast';

const Home = () => {
  const [demoUrl, setDemoUrl] = useState('https://docs.google.com/document/d/1eAKrg7HjZGCvakBylkNu-dbgSX8ykd7F2oQ5PvoM0Hs/edit');
  const { extractDocumentId } = useGoogleDocsStore();

  const handleDemoExtraction = () => {
    try {
      const result = extractDocumentId(demoUrl);
      toast.success(`ডকুমেন্ট ID: ${result.documentId}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const copyDemoUrl = () => {
    navigator.clipboard.writeText(demoUrl);
    toast.success('URL কপি করা হয়েছে!');
  };

  return (
    <>
      <Helmet>
        <title>গুগল ডকস রিডার | MERN Stack অ্যাপ্লিকেশন</title>
        <meta name="description" content="গুগল ডকস API ব্যবহার করে ডকুমেন্ট পড়ার জন্য MERN Stack অ্যাপ্লিকেশন" />
      </Helmet>

      {/* হিরো সেকশন */}
      <motion.div 
        className="hero min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-gray-800 mb-6"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="text-blue-600">গুগল ডকস</span> রিডার
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              MERN Stack ব্যবহার করে তৈরি একটি শক্তিশালী অ্যাপ্লিকেশন যা 
              গুগল ডকস API এর মাধ্যমে যেকোনো ডকুমেন্ট পড়তে এবং বিশ্লেষণ করতে পারে
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link 
                to="/auth/google" 
                className="btn btn-primary btn-lg text-white px-8 py-3 text-lg"
              >
                <FaGoogle className="mr-2" />
                শুরু করুন
              </Link>
              
              <Link 
                to="/documents" 
                className="btn btn-outline btn-lg px-8 py-3 text-lg"
              >
                <FaFileAlt className="mr-2" />
                ডেমো দেখুন
              </Link>
            </motion.div>

            {/* ডেমো URL সেকশন */}
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                ডেমো ডকুমেন্ট URL:
              </h3>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="text"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="input input-bordered flex-1 text-sm"
                  placeholder="গুগল ডকস URL পেস্ট করুন"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={copyDemoUrl}
                    className="btn btn-sm btn-ghost"
                    title="URL কপি করুন"
                  >
                    <FaCopy />
                  </button>
                  <button 
                    onClick={handleDemoExtraction}
                    className="btn btn-sm btn-primary"
                  >
                    ID বের করুন
                  </button>
                  <a 
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-ghost"
                    title="নতুন ট্যাবে খুলুন"
                  >
                    <FaExternalLinkAlt />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ফিচার সেকশন */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              প্রধান বৈশিষ্ট্যসমূহ
            </h2>
            <p className="text-xl text-gray-600">
              আধুনিক প্রযুক্তি ব্যবহার করে তৈরি শক্তিশালী সমাধান
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaGoogle className="text-4xl text-blue-500" />,
                title: "গুগল API ইন্টিগ্রেশন",
                description: "সরাসরি গুগল ডকস API এর সাথে সংযুক্ত হয়ে ডকুমেন্ট অ্যাক্সেস করুন"
              },
              {
                icon: <FaFileAlt className="text-4xl text-green-500" />,
                title: "ডকুমেন্ট বিশ্লেষণ",
                description: "ডকুমেন্টের গঠন, শব্দ সংখ্যা এবং অন্যান্য তথ্য বিশ্লেষণ করুন"
              },
              {
                icon: <FaShieldAlt className="text-4xl text-red-500" />,
                title: "নিরাপত্তা",
                description: "OAuth 2.0 এবং JWT ব্যবহার করে সর্বোচ্চ নিরাপত্তা নিশ্চিত করা হয়েছে"
              },
              {
                icon: <FaRocket className="text-4xl text-purple-500" />,
                title: "দ্রুত গতি",
                description: "অপ্টিমাইজড কোড এবং ক্যাশিং সিস্টেমের মাধ্যমে দ্রুত পারফরমেন্স"
              },
              {
                icon: <FaUsers className="text-4xl text-orange-500" />,
                title: "ব্যবহারকারী বান্ধব",
                description: "সহজ এবং স্বজ্ঞাত ইউজার ইন্টারফেস যা সবার জন্য ব্যবহার করা সহজ"
              },
              {
                icon: <FaFileAlt className="text-4xl text-teal-500" />,
                title: "ডাটাবেস সংরক্ষণ",
                description: "MongoDB ব্যবহার করে ডকুমেন্টের তথ্য নিরাপদে সংরক্ষণ"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-lg transition-shadow duration-300"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* টেকনোলজি স্ট্যাক */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              ব্যবহৃত প্রযুক্তি
            </h2>
            <p className="text-xl text-gray-600">
              MERN Stack এবং আধুনিক লাইব্রেরি
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "MongoDB", color: "text-green-600" },
              { name: "Express.js", color: "text-gray-600" },
              { name: "React.js", color: "text-blue-600" },
              { name: "Node.js", color: "text-green-500" },
              { name: "Google APIs", color: "text-red-500" },
              { name: "Tailwind CSS", color: "text-cyan-500" },
              { name: "JWT", color: "text-purple-600" },
              { name: "Axios", color: "text-blue-500" }
            ].map((tech, index) => (
              <motion.div
                key={index}
                className="text-center p-4 bg-white rounded-lg shadow-sm"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1 }}
              >
                <h4 className={`text-lg font-semibold ${tech.color}`}>
                  {tech.name}
                </h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* কল টু অ্যাকশন */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              আজই শুরু করুন
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              গুগল ডকস API এর শক্তি ব্যবহার করে আপনার ডকুমেন্ট ম্যানেজমেন্টকে নিয়ে যান পরবর্তী স্তরে
            </p>
            <Link 
              to="/auth/google" 
              className="btn btn-lg bg-white text-blue-600 hover:bg-gray-100 border-none px-8 py-3"
            >
              <FaGoogle className="mr-2" />
              Google এর সাথে সাইন ইন করুন
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;