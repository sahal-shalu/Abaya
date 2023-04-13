
modulel.exports=function getPaginationData(products, currentPage, productsPerPage) {
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
  
    return {
      products: products.slice(startIndex, endIndex),
      currentPage,
      totalPages
    };
  }
  

  