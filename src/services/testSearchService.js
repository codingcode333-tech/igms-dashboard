// Test file to verify FastAPI search service integration
import searchService, { SEARCH_TYPES } from '@/services/searchService';

// Test the search functionality
export const testSearchService = async () => {
  console.log('🔍 Testing FastAPI Search Service Integration...');
  
  try {
    // Test 1: Semantic Search
    console.log('\n📊 Testing Semantic Search...');
    const semanticResult = await searchService.semanticSearch('electricity', {
      size: 5,
      threshold: 1.5
    });
    
    if (semanticResult.success) {
      console.log('✅ Semantic Search successful');
      console.log(`   Found ${semanticResult.totalCount} total results`);
      console.log(`   Retrieved ${semanticResult.grievances.length} grievances`);
      
      if (semanticResult.grievances.length > 0) {
        const sample = semanticResult.grievances[0];
        console.log('   Sample result:', {
          id: sample.id,
          complaint: sample.complaintDetails?.substring(0, 50) + '...',
          status: sample.complaintStatus,
          state: sample.stateName
        });
      }
    } else {
      console.log('❌ Semantic Search failed:', semanticResult.error);
    }

    // Test 2: Keyword Search
    console.log('\n🔑 Testing Keyword Search...');
    const keywordResult = await searchService.keywordSearch('water', {
      size: 3
    });
    
    if (keywordResult.success) {
      console.log('✅ Keyword Search successful');
      console.log(`   Found ${keywordResult.totalCount} total results`);
    } else {
      console.log('❌ Keyword Search failed:', keywordResult.error);
    }

    // Test 3: Hybrid Search
    console.log('\n🔄 Testing Hybrid Search...');
    const hybridResult = await searchService.hybridSearch('complaint', {
      size: 3
    });
    
    if (hybridResult.success) {
      console.log('✅ Hybrid Search successful');
      console.log(`   Found ${hybridResult.totalCount} total results`);
    } else {
      console.log('❌ Hybrid Search failed:', hybridResult.error);
    }

    // Test 4: Statistics
    console.log('\n📈 Testing Statistics Generation...');
    const statsResult = await searchService.getGrievanceStats('');
    
    if (statsResult.success) {
      console.log('✅ Statistics generation successful');
      console.log('   Available data:', Object.keys(statsResult.data));
    } else {
      console.log('❌ Statistics generation failed:', statsResult.error);
    }

    // Test 5: AI Categories
    console.log('\n🤖 Testing AI Category Generation...');
    const aiCategoriesResult = await searchService.generateAICategories({
      startdate: '2024-01-01',
      enddate: '2024-12-31',
      ministry: 'DOCAF',
      rcadata: {
        words: ['electricity', 'billing', 'complaint', 'service'],
        count: 4,
        doc_ids: ['doc1', 'doc2', 'doc3', 'doc4']
      }
    });
    
    if (aiCategoriesResult.success) {
      console.log('✅ AI Categories generation successful');
      console.log('   Generated categories:', Object.keys(aiCategoriesResult.data || {}));
    } else {
      console.log('❌ AI Categories generation failed:', aiCategoriesResult.error);
    }

    console.log('\n🎉 FastAPI Integration Test Complete!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
};

// Auto-run test when in development mode
if (import.meta.env.DEV) {
  // Uncomment the line below to run the test automatically
  // testSearchService();
}

export default testSearchService;
