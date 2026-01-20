import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function SmartBreadcrumbs({ currentPage, navigationHistory = [] }) {
  const breadcrumbs = [
    { name: 'Home', page: 'Home' },
    ...navigationHistory.slice(-3).map(h => ({
      name: h.page_name?.replace(/([A-Z])/g, ' $1').trim() || h.page_name,
      page: h.page_name
    })),
    { name: currentPage?.replace(/([A-Z])/g, ' $1').trim() || currentPage, page: currentPage, current: true }
  ].filter((v, i, a) => a.findIndex(t => t.page === v.page) === i);

  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      {breadcrumbs.map((crumb, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-2"
        >
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-white/40" />
          )}
          
          {crumb.current ? (
            <span className="text-white font-semibold">{crumb.name}</span>
          ) : (
            <Link
              to={createPageUrl(crumb.page)}
              className="text-white/60 hover:text-white transition-colors"
            >
              {index === 0 ? <Home className="w-4 h-4" /> : crumb.name}
            </Link>
          )}
        </motion.div>
      ))}
    </nav>
  );
}