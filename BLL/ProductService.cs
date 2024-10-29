using AutoMapper;
using BEL;
using DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class ProductService
    {
        static ProductService()
        {
            Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<Buyer, BuyerModel>().ReverseMap();
                cfg.CreateMap<Category, CategoryModel>().ReverseMap();
                cfg.CreateMap<Coupon, CouponModel>().ReverseMap();
                cfg.CreateMap<Token, TokenModel>().ReverseMap();
                cfg.CreateMap<User, UserModel>().ReverseMap();
                cfg.CreateMap<UserID, UserIdModel>().ReverseMap();
                cfg.CreateMap<Delivery, DeliveryModel>().ReverseMap();
                cfg.CreateMap<Transaction, TransactionModel>().ReverseMap();
                cfg.CreateMap<Product, ProductModel>().ReverseMap();
            });
        }

        public static void Create(ProductModel b)
        {
            var data = Mapper.Map<Product>(b);
            DataSupplier.ProductDataAccess().Add(data);
        }

        public static void Edit(ProductModel b)
        {
            var data = Mapper.Map<Product>(b);
            DataSupplier.ProductDataAccess().Edit(data);
        }

        public static bool Delete(int id)
        {
            DataSupplier.ProductDataAccess().Delete(id);
            return true;
        }

        public static List<ProductModel> Get()
        {
            var data = Mapper.Map<List<ProductModel>>(DataSupplier.ProductDataAccess().Get());
            return data;
        }
        public static ProductModel Get(int id)
        {
            var data = Mapper.Map<ProductModel>(DataSupplier.ProductDataAccess().Get(id));
            return data;
        }

        public static List<ProductModel> GetProductByCategory(string s)
        {
            var data = Mapper.Map<List<ProductModel>>(DataSupplier.ProductDataAccess().GetProductByCategory(s));
            return data;
        }

        public static List<ProductModel> GetProductByProduct(string s)
        {
            var data = Mapper.Map<List<ProductModel>>(DataSupplier.ProductDataAccess().GetProductByProduct(s));
            return data;
        }

        public static List<ProductModel> GetAllHiddenProducts()
        {
            var data = Mapper.Map<List<ProductModel>>(DataSupplier.ProductDataAccess().GetAllHiddenProducts());
            return data;
        }

        public static bool HideProduct(int id)
        {
            DataSupplier.ProductDataAccess().HideProduct(id);
            return true;
        }

        public static bool ExhibitProduct(int id)
        {
            DataSupplier.ProductDataAccess().ExhibitProduct(id);
            return true;
        }
    }
}
