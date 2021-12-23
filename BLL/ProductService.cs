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
                cfg.CreateMap<Buyer, BuyerModel>();
                cfg.CreateMap<BuyerModel, Buyer>();
                cfg.CreateMap<Category, CategoryModel>();
                cfg.CreateMap<CategoryModel, Category>();
                cfg.CreateMap<Coupon, CouponModel>();
                cfg.CreateMap<CouponModel, Coupon>();
                cfg.CreateMap<Token, TokenModel>();
                cfg.CreateMap<TokenModel, Token>();
                cfg.CreateMap<User, UserModel>();
                cfg.CreateMap<UserModel, User>();
                cfg.CreateMap<UserID, UserIdModel>();
                cfg.CreateMap<UserIdModel, UserID>();
                cfg.CreateMap<Delivery, DeliveryModel>();
                cfg.CreateMap<DeliveryModel, Delivery>();
                cfg.CreateMap<Transaction, TransactionModel>();
                cfg.CreateMap<TransactionModel, Transaction>();
                cfg.CreateMap<Product, ProductModel>();
                cfg.CreateMap<ProductModel, Product>();
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
