'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Linkedin, Instagram, Mail, MapPin, Phone, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground" data-macaly="footer-logo">BlogApp</h3>
            <p className="text-muted-foreground" data-macaly="footer-description">
              A modern blogging platform where ideas come to life. Share your thoughts, connect with others, and build your digital presence.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/my-account" className="text-muted-foreground hover:text-foreground transition-colors">
                My Account
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact & Feedback
              </Link>
            </div>
          </div>

          {/* Contact BlogApp */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Contact BlogApp
            </h4>
            <div className="space-y-3">
              {/* Developer Info Card */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">AY</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Ayush</h5>
                    <p className="text-sm text-muted-foreground">Full Stack Developer</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  {/* <div className="flex items-center text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>ayush.dev@blogapp.com</span>
                  </div> */}
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Chandigarh, India</span>
                  </div>
                  {/* <div className="flex items-center text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>+91 98765-43210</span>
                  </div> */}
                </div>
                
                {/* Developer Social Links */}
                <div className="flex space-x-2 pt-2">
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    href="https://github.com/ayu2046"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted p-2 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <Github className="w-4 h-4 text-foreground" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    href="https://www.linkedin.com/in/ayush-awasthi-031437219/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted p-2 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-foreground" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    href="https://instagram.com/_ayu_2046"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted p-2 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-foreground" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    href="mailto:awasthiayush3399@gmail.com"
                    className="bg-muted p-2 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-foreground" />
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feedback Form */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Send Feedback</h4>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Have feedback or found an issue? Let us know!</p>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contact Us</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 BlogApp. All rights reserved. Built with ❤️ and Lot's of Coffee</p>
        </div>
      </div>
    </footer>
  );
}