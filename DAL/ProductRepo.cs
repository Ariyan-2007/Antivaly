using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace DAL
{
    public class ProductRepo : IProductRepository<Product, int> 
    {
        AntivalyEntities db;

        public ProductRepo(AntivalyEntities db)
        {
            this.db = db;
        }

        public void Add(Product e)
        {
            db.Products.Add(e);
            db.SaveChanges();
        }

        public void Delete(int id)
        {
            var p = db.Products.FirstOrDefault(c => c.PID == id);
            db.Products.Remove(p);
            db.SaveChanges();
        }

        public void Edit(Product e)
        {
            var p = db.Products.FirstOrDefault(en => en.PID == e.PID);
            db.Entry(p).CurrentValues.SetValues(e);
            db.SaveChanges();
        }

        public List<Product> Get()
        {
            return db.Products.Where(x => x.PStatus == null).ToList();
        }

        public List<Product> GetAllHiddenProducts()
        {
            return db.Products.Where(x => x.PStatus != null).ToList();
        }

        public void HideProduct(int id)
        {
            var d = db.Products.FirstOrDefault(e => e.PID == id);
            var temp = d;
            temp.PStatus = "X";
            db.Entry(d).CurrentValues.SetValues(temp);
            db.SaveChanges();
        }

        public void ExhibitProduct(int id)
        {
            var d = db.Products.FirstOrDefault(e => e.PID == id);
            var temp = d;
            temp.PStatus = null;
            db.Entry(d).CurrentValues.SetValues(temp);
            db.SaveChanges();
        }

        public Product Get(int id)
        {
            return db.Products.FirstOrDefault(en => en.PID == id && en.PStatus == null);
        }
        public Product Get(string uid)
        {
            return db.Products.FirstOrDefault(en => en.UID == uid && en.PStatus == null);
        }

        public List<Product> GetProductByCategory(string s)
        {
            return db.Products.Where(x => x.CatName.Contains(s) && x.PStatus == null).ToList();
        }

        public List<Product> GetProductByProduct(string s)
        {
            return db.Products.Where(x => x.PName.Contains(s) && x.PStatus == null).ToList();
        }
    }
}
