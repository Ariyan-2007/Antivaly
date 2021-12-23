using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public interface IProductRepository<T, ID>: IRepository<T, ID>
    {
        List<T> GetAllHiddenProducts();
        void HideProduct(ID id);
        void ExhibitProduct(ID id);
        List<T> GetProductByCategory(string s);
        List<T> GetProductByProduct(string s);
    }
}
