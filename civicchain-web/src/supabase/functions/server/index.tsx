import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ============================================
// AUTH ROUTES
// ============================================

app.post('/make-server-60aaff80/auth/login', async (c) => {
  try {
    const { municipalId, password } = await c.req.json();
    
    const { data, error } = await supabase
      .from('municipals')
      .select('id, name, state_id, password')
      .eq('id', municipalId)
      .single();
    
    if (error || !data) {
      console.log('Login error: Municipal not found', error);
      return c.json({ success: false, message: 'Invalid credentials' }, 401);
    }
    
    if (data.password !== password) {
      console.log('Login error: Invalid password');
      return c.json({ success: false, message: 'Invalid credentials' }, 401);
    }
    
    return c.json({
      success: true,
      municipal: {
        id: data.id,
        name: data.name,
        state_id: data.state_id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ success: false, message: 'Login failed', error: String(error) }, 500);
  }
});

// ============================================
// STATES ROUTES
// ============================================

app.get('/make-server-60aaff80/states', async (c) => {
  try {
    const { data, error } = await supabase
      .from('states')
      .select('id, name')
      .order('name');
    
    if (error) {
      console.error('Error fetching states:', error);
      return c.json({ error: 'Failed to fetch states' }, 500);
    }
    
    return c.json(data || []);
  } catch (error) {
    console.error('Error fetching states:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================
// MUNICIPALS ROUTES
// ============================================

app.get('/make-server-60aaff80/municipals/:stateId', async (c) => {
  try {
    const stateId = c.req.param('stateId');
    
    const { data, error } = await supabase
      .from('municipals')
      .select('id, name, state_id')
      .eq('state_id', stateId)
      .order('name');
    
    if (error) {
      console.error('Error fetching municipals:', error);
      return c.json({ error: 'Failed to fetch municipals' }, 500);
    }
    
    return c.json(data || []);
  } catch (error) {
    console.error('Error fetching municipals:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================
// CATEGORIES ROUTES
// ============================================

app.get('/make-server-60aaff80/categories', async (c) => {
  try {
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, department_id');
    
    if (catError) {
      console.error('Error fetching categories:', catError);
      return c.json({ error: 'Failed to fetch categories' }, 500);
    }

    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('id, icon');
    
    if (deptError) {
      console.error('Error fetching departments:', deptError);
      return c.json({ error: 'Failed to fetch departments' }, 500);
    }

    // Map icons to categories
    const deptMap = new Map(departments?.map(d => [d.id, d.icon]) || []);
    const result = categories?.map(cat => ({
      ...cat,
      icon: deptMap.get(cat.department_id) || '📋',
    })) || [];
    
    return c.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================
// COMPLAINTS ROUTES
// ============================================

app.get('/make-server-60aaff80/complaints/:municipalId', async (c) => {
  try {
    const municipalId = c.req.param('municipalId');
    
    const { data: complaints, error: complaintError } = await supabase
      .from('complaints')
      .select('*')
      .eq('municipal_id', municipalId)
      .order('submitted_date', { ascending: false });
    
    if (complaintError) {
      console.error('Error fetching complaints:', complaintError);
      return c.json({ error: 'Failed to fetch complaints' }, 500);
    }

    // Fetch resolution images for resolved/verified complaints
    const complaintIds = complaints?.filter(c => c.status === 'resolved' || c.status === 'verified').map(c => c.id) || [];
    let resolutionImagesMap = new Map<number, string[]>();
    
    if (complaintIds.length > 0) {
      const { data: images, error: imageError } = await supabase
        .from('resolution_images')
        .select('complaint_id, image_url')
        .in('complaint_id', complaintIds)
        .order('uploaded_date', { ascending: true });
      
      if (!imageError && images) {
        console.log(`Found ${images.length} resolution images for ${complaintIds.length} complaints`);
        
        // Group images by complaint_id
        // Images can be either:
        // 1. Supabase Storage URLs (https://...)
        // 2. Base64 data URIs (data:image/...)
        // 3. Raw base64 strings (legacy - need to add prefix)
        images.forEach(img => {
          if (!resolutionImagesMap.has(img.complaint_id)) {
            resolutionImagesMap.set(img.complaint_id, []);
          }
          
          let imageUrl = img.image_url;
          if (imageUrl) {
            // If it's a Supabase Storage URL or already has data URI prefix, use as-is
            if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
              // It's a raw base64 string (legacy), add the data URI prefix
              let format = 'jpeg';
              if (imageUrl.startsWith('/9j/')) format = 'jpeg';
              else if (imageUrl.startsWith('iVBORw')) format = 'png';
              else if (imageUrl.startsWith('R0lGOD')) format = 'gif';
              else if (imageUrl.startsWith('UklGR')) format = 'webp';
              
              imageUrl = `data:image/${format};base64,${imageUrl}`;
              console.log(`Converted legacy base64 for complaint ${img.complaint_id}`);
            } else if (imageUrl.startsWith('http')) {
              console.log(`Storage URL for complaint ${img.complaint_id}: ${imageUrl}`);
            }
          }
          
          resolutionImagesMap.get(img.complaint_id)!.push(imageUrl);
        });
        
        console.log(`Processed resolution images for complaints:`, Array.from(resolutionImagesMap.keys()));
      } else if (imageError) {
        console.error('Error fetching resolution images:', imageError);
      }
    }

    // Fetch verification counts for all complaints
    const { data: verifications, error: verifyError } = await supabase
      .from('citizen_verifications')
      .select('complaint_id');
    
    const verificationCounts = new Map<number, number>();
    if (!verifyError && verifications) {
      verifications.forEach(v => {
        verificationCounts.set(v.complaint_id, (verificationCounts.get(v.complaint_id) || 0) + 1);
      });
    }

    // Fetch officer names
    const officerIds = [...new Set(complaints?.map(c => c.resolved_by).filter(Boolean) || [])];
    let officerMap = new Map();
    
    if (officerIds.length > 0) {
      const { data: officers, error: officerError } = await supabase
        .from('officers')
        .select('id, name')
        .in('id', officerIds);
      
      if (!officerError && officers) {
        officers.forEach(o => officerMap.set(o.id, o.name));
      }
    }

    // Helper function to ensure proper image format
    const formatImageUrl = (url: string | null): string => {
      if (!url) return '';
      
      // If it's already a proper URL or data URI, return as-is
      if (url.startsWith('http') || url.startsWith('data:')) {
        return url;
      }
      
      // It's a raw base64 string - detect format and add data URI prefix
      let format = 'jpeg';
      if (url.startsWith('/9j/')) format = 'jpeg';
      else if (url.startsWith('iVBORw')) format = 'png';
      else if (url.startsWith('R0lGOD')) format = 'gif';
      else if (url.startsWith('UklGR')) format = 'webp';
      
      return `data:image/${format};base64,${url}`;
    };

    // Map resolution images to complaints
    const result = complaints?.map(complaint => {
      const submittedDate = new Date(complaint.submitted_date);
      const endDate = complaint.resolved_date ? new Date(complaint.resolved_date) : new Date();
      const daysPending = Math.ceil((endDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const resolutionImages = resolutionImagesMap.get(complaint.id) || [];
      
      // Log resolution images for debugging
      if ((complaint.status === 'resolved' || complaint.status === 'verified') && resolutionImages.length > 0) {
        console.log(`Complaint ${complaint.id} has ${resolutionImages.length} resolution images`);
      } else if (complaint.status === 'resolved' || complaint.status === 'verified') {
        console.log(`WARNING: Complaint ${complaint.id} is ${complaint.status} but has no resolution images`);
      }
      
      // Parse GPS coordinates from PostgreSQL numeric type
      // PostgreSQL numeric columns return as strings in JavaScript
      let latitude = null;
      let longitude = null;
      
      try {
        if (complaint.latitude !== null && complaint.latitude !== undefined) {
          const latNum = parseFloat(String(complaint.latitude));
          if (!isNaN(latNum) && latNum >= -90 && latNum <= 90) {
            latitude = latNum;
          }
        }
        if (complaint.longitude !== null && complaint.longitude !== undefined) {
          const lngNum = parseFloat(String(complaint.longitude));
          if (!isNaN(lngNum) && lngNum >= -180 && lngNum <= 180) {
            longitude = lngNum;
          }
        }
      } catch (err) {
        console.error(`Error parsing GPS for complaint ${complaint.id}:`, err);
      }
      
      return {
        id: complaint.id,
        category: complaint.category_id,
        title: complaint.title,
        description: complaint.description,
        location: complaint.location,
        latitude: latitude,
        longitude: longitude,
        votes: complaint.votes,
        submittedDate: complaint.submitted_date,
        status: complaint.status,
        photo: formatImageUrl(complaint.photo_url),
        resolutionImage: resolutionImages.length > 0 ? resolutionImages[0] : undefined, // First image for backwards compatibility
        resolutionImages: resolutionImages, // All images
        resolvedDate: complaint.resolved_date,
        verificationCount: verificationCounts.get(complaint.id) || 0,
        daysPending: daysPending,
        resolvedByOfficer: complaint.resolved_by ? officerMap.get(complaint.resolved_by) : undefined,
      };
    }) || [];
    
    return c.json(result);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Citizen verification endpoint
app.post('/make-server-60aaff80/complaints/:id/citizen-verify', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { citizenName, citizenEmail, citizenPhone } = await c.req.json();
    
    // Insert verification
    const { error: insertError } = await supabase
      .from('citizen_verifications')
      .insert({
        complaint_id: id,
        citizen_name: citizenName,
        citizen_email: citizenEmail,
        citizen_phone: citizenPhone,
      });
    
    if (insertError) {
      console.error('Error adding citizen verification:', insertError);
      if (insertError.code === '23505') {
        return c.json({ error: 'You have already verified this complaint' }, 400);
      }
      return c.json({ error: 'Failed to add verification' }, 500);
    }
    
    // Check verification count - trigger will auto-verify if >= 3
    const { data: verifications, error: countError } = await supabase
      .from('citizen_verifications')
      .select('id')
      .eq('complaint_id', id);
    
    const count = verifications?.length || 0;
    
    return c.json({ success: true, verificationCount: count });
  } catch (error) {
    console.error('Error in citizen verification:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get verifications for a complaint
app.get('/make-server-60aaff80/complaints/:id/verifications', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    const { data, error } = await supabase
      .from('citizen_verifications')
      .select('*')
      .eq('complaint_id', id)
      .order('verification_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching verifications:', error);
      return c.json({ error: 'Failed to fetch verifications' }, 500);
    }
    
    return c.json(data || []);
  } catch (error) {
    console.error('Error fetching verifications:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/make-server-60aaff80/complaints/:id/resolve', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { imageUrl, officerName } = await c.req.json();
    
    console.log(`Resolving complaint ${id} with image URL: ${imageUrl?.substring(0, 100)}...`);
    
    if (!imageUrl) {
      return c.json({ error: 'Image URL is required' }, 400);
    }
    
    const now = new Date().toISOString();
    
    // Get first officer for this municipal (in a real system, would use authenticated officer)
    let officerId = null;
    const { data: officer } = await supabase
      .from('officers')
      .select('id')
      .limit(1)
      .single();
    
    if (officer) {
      officerId = officer.id;
    }
    
    // Update complaint status to 'resolved' (not 'verified')
    const { error: complaintError } = await supabase
      .from('complaints')
      .update({ 
        status: 'resolved', 
        resolved_date: now,
        resolved_by: officerId,
        updated_at: now,
      })
      .eq('id', id);
    
    if (complaintError) {
      console.error('Error resolving complaint:', complaintError);
      return c.json({ error: 'Failed to resolve complaint' }, 500);
    }
    
    // Insert resolution image (can be Storage URL or data URI)
    const { error: imageError } = await supabase
      .from('resolution_images')
      .insert({
        complaint_id: id,
        image_url: imageUrl, // Store URL or data URI as-is
        uploaded_by: officerId,
        uploaded_date: now,
      });
    
    if (imageError) {
      console.error('Error saving resolution image:', imageError);
      return c.json({ error: 'Failed to save resolution image' }, 500);
    }
    
    console.log(`Successfully resolved complaint ${id} and saved image`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error resolving complaint:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================
// STATS ROUTES
// ============================================

app.get('/make-server-60aaff80/stats/:municipalId', async (c) => {
  try {
    const municipalId = c.req.param('municipalId');
    
    // Use the municipal_complaint_stats view
    const { data: stats, error: statsError } = await supabase
      .from('municipal_complaint_stats')
      .select('*')
      .eq('municipal_id', municipalId)
      .single();
    
    if (statsError) {
      console.error('Error fetching from view, falling back to direct query:', statsError);
      // Fallback to direct query if view fails
      const { data: complaints, error } = await supabase
        .from('complaints')
        .select('status')
        .eq('municipal_id', municipalId);
      
      if (error) {
        console.error('Error fetching stats:', error);
        return c.json({ error: 'Failed to fetch stats' }, 500);
      }
      
      const total = complaints?.length || 0;
      const pending = complaints?.filter(c => c.status === 'pending').length || 0;
      const verified = complaints?.filter(c => c.status === 'verified').length || 0;
      const resolved = complaints?.filter(c => c.status === 'resolved').length || 0;
      
      return c.json({
        total,
        pending,
        verified,
        resolved,
      });
    }
    
    return c.json({
      total: stats.total_complaints || 0,
      pending: stats.pending_count || 0,
      verified: stats.verified_count || 0,
      resolved: stats.resolved_count || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/make-server-60aaff80/stats/:municipalId/monthly', async (c) => {
  try {
    const municipalId = c.req.param('municipalId');
    
    // Get complaints from last 7 months
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);
    
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('category_id, submitted_date')
      .eq('municipal_id', municipalId)
      .gte('submitted_date', sevenMonthsAgo.toISOString());
    
    if (error) {
      console.error('Error fetching monthly trends:', error);
      return c.json({ error: 'Failed to fetch monthly trends' }, 500);
    }
    
    // Group by month and category
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthOrder: any = {};
    
    // Initialize last 7 months with zeros
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthNames[d.getMonth()];
      monthOrder[monthKey] = { month: monthKey, roads: 0, waste: 0, streetlights: 0, water: 0, sewage: 0, others: 0 };
    }
    
    complaints?.forEach(complaint => {
      const date = new Date(complaint.submitted_date);
      const monthKey = monthNames[date.getMonth()];
      
      if (monthOrder[monthKey]) {
        if (complaint.category_id === 'roads') monthOrder[monthKey].roads++;
        else if (complaint.category_id === 'waste') monthOrder[monthKey].waste++;
        else if (complaint.category_id === 'streetlights') monthOrder[monthKey].streetlights++;
        else if (complaint.category_id === 'water') monthOrder[monthKey].water++;
        else if (complaint.category_id === 'sewage') monthOrder[monthKey].sewage++;
        else monthOrder[monthKey].others++;
      }
    });
    
    return c.json(Object.values(monthOrder));
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/make-server-60aaff80/stats/:municipalId/performance', async (c) => {
  try {
    const municipalId = c.req.param('municipalId');
    
    // Get all categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name');
    
    if (catError) {
      console.error('Error fetching categories for performance:', catError);
      return c.json({ error: 'Failed to fetch categories' }, 500);
    }
    
    // Get complaints grouped by category
    const { data: complaints, error: complaintError } = await supabase
      .from('complaints')
      .select('category_id, status, submitted_date, resolved_date')
      .eq('municipal_id', municipalId);
    
    if (complaintError) {
      console.error('Error fetching complaints for performance:', complaintError);
      return c.json({ error: 'Failed to fetch complaints' }, 500);
    }
    
    // Calculate performance metrics for each category
    const performance = categories?.map(category => {
      const categoryComplaints = complaints?.filter(c => c.category_id === category.id) || [];
      const total = categoryComplaints.length;
      const resolved = categoryComplaints.filter(c => c.status === 'resolved').length;
      
      // Calculate average resolution time
      const resolvedWithTime = categoryComplaints.filter(c => c.status === 'resolved' && c.resolved_date);
      let avgResolutionTime = '0 days';
      
      if (resolvedWithTime.length > 0) {
        const totalDays = resolvedWithTime.reduce((sum, c) => {
          const submitted = new Date(c.submitted_date);
          const resolvedDate = new Date(c.resolved_date!);
          const days = (resolvedDate.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0);
        const avgDays = (totalDays / resolvedWithTime.length).toFixed(1);
        avgResolutionTime = `${avgDays} days`;
      }
      
      // Calculate score (resolution rate)
      const score = total > 0 ? Math.round((resolved / total) * 100) : 0;
      
      return {
        department: category.name,
        total,
        resolved,
        avgResolutionTime,
        score,
      };
    }) || [];
    
    // Sort by score descending
    performance.sort((a, b) => b.score - a.score);
    
    return c.json(performance);
  } catch (error) {
    console.error('Error fetching performance:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Analytics endpoint for AI insights
app.get('/make-server-60aaff80/stats/:municipalId/analytics', async (c) => {
  try {
    const municipalId = c.req.param('municipalId');
    
    // Get all complaints with verification count
    const { data: complaints, error } = await supabase
      .from('complaints_with_verification_count')
      .select('*')
      .eq('municipal_id', municipalId);
    
    if (error) {
      console.error('Error fetching analytics data:', error);
      return c.json({ error: 'Failed to fetch analytics' }, 500);
    }
    
    // Calculate insights
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Category distribution
    const categoryStats: any = {};
    complaints?.forEach(c => {
      if (!categoryStats[c.category_id]) {
        categoryStats[c.category_id] = { total: 0, resolved: 0, totalDays: 0, resolvedCount: 0 };
      }
      categoryStats[c.category_id].total++;
      if (c.status === 'resolved' || c.status === 'verified') {
        categoryStats[c.category_id].resolved++;
        if (c.resolved_date) {
          const days = (new Date(c.resolved_date).getTime() - new Date(c.submitted_date).getTime()) / (1000 * 60 * 60 * 24);
          categoryStats[c.category_id].totalDays += days;
          categoryStats[c.category_id].resolvedCount++;
        }
      }
    });
    
    // Monthly trends by category (last 3 months for trend analysis)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const monthlyTrends: any = {};
    complaints?.filter(c => new Date(c.submitted_date) >= threeMonthsAgo).forEach(c => {
      const date = new Date(c.submitted_date);
      const monthKey = monthNames[date.getMonth()];
      
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = {};
      }
      if (!monthlyTrends[monthKey][c.category_id]) {
        monthlyTrends[monthKey][c.category_id] = 0;
      }
      monthlyTrends[monthKey][c.category_id]++;
    });
    
    // Calculate verification metrics
    const resolvedWithVerification = complaints?.filter(c => c.status === 'verified' && c.verification_count >= 3).length || 0;
    const resolvedTotal = complaints?.filter(c => c.status === 'resolved' || c.status === 'verified').length || 0;
    const verificationRate = resolvedTotal > 0 ? (resolvedWithVerification / resolvedTotal) * 100 : 0;
    
    return c.json({
      categoryStats,
      monthlyTrends,
      totalComplaints: complaints?.length || 0,
      resolvedComplaints: resolvedTotal,
      verificationRate,
      avgVerificationsPerComplaint: complaints && complaints.length > 0 
        ? complaints.reduce((sum, c) => sum + (c.verification_count || 0), 0) / complaints.length 
        : 0,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Health check
app.get('/make-server-60aaff80/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
