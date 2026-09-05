import React, { useState, useRef } from 'react';
import { Star, Camera, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

import { isEmail } from '../../lib/validation';

export default function ReviewForm({ productId, productSlug, productName, onReviewSubmitted }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState([]);
  
  const fileInputRef = useRef(null);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (rating === 0) newErrors.rating = 'Please select a star rating';
    if (!body.trim()) {
      newErrors.body = 'Review body is required';
    } else if (body.trim().length < 20) {
      newErrors.body = 'Review must be at least 20 characters long';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      setSubmitError('You can only upload up to 3 images.');
      return;
    }
    const validFiles = files.filter(f => f.type.startsWith('image/'));
    setImages(prev => [...prev, ...validFiles].slice(0, 3));
    setSubmitError('');
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const imageUrls = [];
      
      // Upload images if any
      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('review-images')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('review-images')
          .getPublicUrl(data.path);
          
        imageUrls.push(publicUrl);
      }

      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          product_slug: productSlug,
          reviewer_name: name.trim(),
          reviewer_email: email.trim(),
          rating: rating,
          review_title: title.trim() || null,
          review_body: body.trim(),
          images: imageUrls
        });

      if (error) throw error;
      
      setIsSuccess(true);
      if (onReviewSubmitted) onReviewSubmitted();
      
      // Optional: Reset form fields here if you want them to submit another, 
      // but usually success state hides the form or shows a thank you.
    } catch (err) {
      console.error('Error submitting review:', err);
      setSubmitError('Failed to submit review. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl p-8 text-center mt-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star size={24} className="text-green-600 fill-green-600" />
        </div>
        <h3 className="text-lg font-bold text-[#0A1628] mb-2">Thank you for your review!</h3>
        <p className="text-[#718096] text-sm">
          Your review has been submitted and will appear after moderation.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white border border-[#E2E8F0] rounded-2xl p-6 md:p-8 shadow-sm">
      <h3 className="text-lg font-bold text-[#0A1628] mb-1">Write a Review</h3>
      <p className="text-sm text-[#718096] mb-6">Share your experience with {productName}</p>
      
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-[#0A1628] mb-2">
            Overall Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRating(star);
                  if (errors.rating) setErrors(prev => ({ ...prev, rating: undefined }));
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
              >
                <Star 
                  size={24} 
                  className={`transition-colors ${
                    (hoverRating || rating) >= star 
                      ? 'text-[#C9A84C] fill-[#C9A84C]' 
                      : 'text-gray-300'
                  }`} 
                />
              </button>
            ))}
          </div>
          {errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div>
            <label htmlFor="reviewer-name" className="block text-sm font-semibold text-[#0A1628] mb-1.5">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              id="reviewer-name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-[#E2E8F0] focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reviewer-email" className="block text-sm font-semibold text-[#0A1628] mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="reviewer-email"
              type="email"
              placeholder="Will not be published"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-[#E2E8F0] focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="review-title" className="block text-sm font-semibold text-[#0A1628] mb-1.5">
            Review Title <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            id="review-title"
            type="text"
            placeholder="Summarise your experience"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-all"
          />
        </div>

        {/* Body */}
        <div>
          <label htmlFor="review-body" className="block text-sm font-semibold text-[#0A1628] mb-1.5">
            Review Details <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review-body"
            rows={4}
            placeholder="What did you like or dislike? (minimum 20 characters)"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (errors.body) setErrors(prev => ({ ...prev, body: undefined }));
            }}
            className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all resize-y ${
              errors.body
                ? 'border-red-400 focus:ring-red-200'
                : 'border-[#E2E8F0] focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]'
            }`}
          />
          {errors.body && <p className="mt-1 text-xs text-red-500">{errors.body}</p>}
        </div>

        {/* Photos Upload */}
        <div>
          <label className="block text-sm font-semibold text-[#0A1628] mb-1.5">
            Add Photos <span className="text-gray-400 font-normal">(Optional, max 3)</span>
          </label>
          
          <div className="flex flex-wrap gap-3 mt-2">
            {images.map((file, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-lg border border-[#E2E8F0] overflow-hidden group">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {images.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-[#E2E8F0] flex flex-col items-center justify-center text-[#718096] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors bg-[#F8F9FA]"
              >
                <Camera size={20} className="mb-1" />
                <span className="text-[10px] font-semibold">Add</span>
              </button>
            )}
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0A1628] text-white text-sm font-bold rounded-[6px] hover:bg-[#1A2E4A] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
